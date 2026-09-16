---
id: "orion"
title: "Orion"
platform: "HackTheBox"
os: "Linux"
difficulty: "Easy"
ip: "10.129.244.146"
date: "15-09-2026"
tags: ["samba","metasploit"]
---
# Orion WriteUp - Hack The Box
**Date**: `2026-08-10`
**Level**: `Easy`
**OS**: `Linux`
**IP**: `10.129.244.146`
**Tags**: `samba`, `metasploit`

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
Realmento no son muchas cosas, pero bueno algo es algo
CONTINUARA