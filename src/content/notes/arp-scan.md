---
# Arp-scan
**Date**: `05-10-2026`
---

El descubrimiento de equipos en la red local es una tarea fundamental en la gestión de redes y en las pruebas de seguridad. Existen diferentes herramientas y técnicas para realizar esta tarea, que van desde el escaneo de puertos hasta el análisis de tráfico de red.

En esta clase, nos enfocaremos en las técnicas de descubrimiento de equipos basadas en los protocolos **ARP** e **ICMP**. Además, se presentarán diferentes herramientas que pueden ser útiles para esta tarea, como **Nmap**, **netdiscover**, **arp-scan** y **masscan**.

Entre los modos de escaneo que se explican en la clase, se encuentra el uso del parámetro ‘**-sn**‘ de Nmap, que permite realizar un escaneo de hosts sin realizar el escaneo de puertos. También se presentan las herramientas netdiscover, arp-scan y masscan, que utilizan el protocolo ARP para descubrir hosts en la red.

Cada herramienta tiene sus propias ventajas y limitaciones. Por ejemplo, **netdiscover** es una herramienta simple y fácil de usar, pero puede ser menos precisa que **arp-scan** o **masscan**. Por otro lado, **arp-scan** y **masscan** son herramientas más potentes, capaces de descubrir hosts más rápido y en redes más grandes, pero también son más complejas y pueden requerir más recursos.

En definitiva, el descubrimiento de equipos en la red local es una tarea fundamental para cualquier administrador de redes o profesional de seguridad de la información. Con las técnicas y herramientas adecuadas, es posible realizar esta tarea de manera efectiva y eficiente.

# PRACTICA
Para saber nuestra IP usamos:
```shell
ifconfig
```
O:
```shell
hostname -I
```

Ahora para el descubrimiento podemos usar también **Nmap**:
```shell
nmap -sn 192.168.1.1/24
```
También podemos jugar con `arp-scan`:
```shell
arp-scan -I eth0 --localnet --ignoredups
```
- `-I`: Indicarle la interfaz de red.
- `--localnet`: Para aplicar el escaneo en la red local.
- `--ignoredups`: Sirve para evitar duplicados.
También hay otras herramientas como `netdiscover`:
```shell
netdiscover -I eth0
```
- `-I`: Indicarle la interfaz de red.
Hace es un barrido, aunque pone es otra mascara de red.

Para hacerlo manual con `ping`, montamos un `script` en `bash`:
```shell
nano NetDiscover.sh
```
Y ponemos lo siguiente:
```bash
#!/bin/bash
function ctrl_c (){
 echo -e "\n\n[!] Saliendo...\n"
 tput cnorm; exit 1
}
tput civis
# Ctrl C
trap ctrl_c SIGINT

for i in $(seq 1 254); do
 timeout 1 bash -c "ping -c 1 192.168.1.$i" &>/dev/null && echo "[+] Host 192.168.1.$i - ACTIVE" &
done
wait
tput cnorm
```

Ahora hay máquinas que no permiten `ping`, hacemos lo siguiente:
```bash
#!/bin/bash
function ctrl_c (){
 echo -e "\n\n[!] Saliendo...\n"
 tput cnorm; exit 1
}
tput civis
# Ctrl C
trap ctrl_c SIGINT

for i in $(seq 1 254); do
 for port in 21 22 23 25 80 139 443 445 8080; do
  timeout 1 bash -c "echo '' >/dev/tcp/192.168.1.$i/$port" 2>/dev/null && echo "[+] Host 192.168.1.$i - Port $port (OPEN)" &
 done
done
wait
tput cnorm
```

Ahora hay otra herramienta similar a `nmap`, llamada `masscan`, que nos sirve para hacer escaneos a nivel de red, pero llega a ser más rápido:
```shell
masscan -p21,22,139,445,8080,80,443 -Pn 192.168.1.1/24 --rate=5000
```