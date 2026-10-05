---
# Fuzzing and Server File Enumeration
**Date**: `05-10-2026`
---

Hagamos uso de las herramientas **Wfuzz** y **Gobuster** para aplicar **Fuzzing**. Esta técnica se utiliza para descubrir rutas y recursos ocultos en un servidor web mediante ataques de fuerza bruta. El objetivo es encontrar recursos ocultos que podrían ser utilizados por atacantes malintencionados para obtener acceso no autorizado al servidor.

**Wfuzz** es una herramienta de descubrimiento de contenido y una herramienta de inyección de datos. Básicamente, se utiliza para automatizar los procesos de prueba de vulnerabilidades en aplicaciones web.

Permite realizar ataques de fuerza bruta en parámetros y directorios de una aplicación web para identificar recursos existentes. Una de las **ventajas** de Wfuzz es que es altamente personalizable y se puede ajustar a diferentes necesidades de pruebas. Algunas de las **desventajas** de Wfuzz incluyen la necesidad de comprender la sintaxis de sus comandos y que puede ser más lenta en comparación con otras herramientas de descubrimiento de contenido.

Por otro lado, **Gobuster** es una herramienta de descubrimiento de contenido que también se utiliza para buscar archivos y directorios ocultos en una aplicación web. Al igual que Wfuzz, Gobuster se basa en ataques de fuerza bruta para encontrar archivos y directorios ocultos. Una de las principales **ventajas** de Gobuster es su velocidad, ya que es conocida por ser una de las herramientas de descubrimiento de contenido más rápidas. También es fácil de usar y su sintaxis es simple. Sin embargo, una **desventaja** de Gobuster es que puede no ser tan personalizable como Wfuzz.

En resumen, tanto Wfuzz como Gobuster son herramientas útiles para pruebas de vulnerabilidades en aplicaciones web, pero tienen diferencias en su enfoque y características. La elección de una u otra dependerá de tus necesidades y preferencias personales.

# APOYO

- **Wfuzz**: [https://github.com/xmendez/wfuzz](https://github.com/xmendez/wfuzz)
- **Gobuster**: [https://github.com/OJ/gobuster](https://github.com/OJ/gobuster)
# GOBUSTER
```shell
gobuster dir -u http://<IP>/ -w /<DIC> -t 200 --add-slash -b 403,404 -x html,php,txt
```
Parámetros:
- `dir`: Permite aplicar Fuzzing a directorios.
- `-u`: Sirve para colocar el dominio a Fuzzear.
- `-w`: Sirve para escoger el diccionario a utilizar.
- `-t`: Sirve para lanzar tareas en paralelo.
- `--add-slash`: Mete una barra al final para ver lo que nos interesa desde un principio en los redirectores.
- `-b`: Mete los códigos de que queramos en la lista negra.
- `-x`: Indicamos extensiones.
- `-s`: Mete los códigos de que queramos en la lista blanca.
# WFUZZ
```shell
wfuzz -c -L --hc=403,404 -t 200 -w /<DIC> http://<IP>/FUZZ
```
Parámetros:
- `FUZZ`: Para indicarle que es aquí donde vamos a sustituir el *payload*.
- `-c`: Representa el output en colores.
- `-t`: Sirve para lanzar tareas en paralelo.
- `-w`: Sirve para escoger el diccionario a utilizar.
- `-L`: Sirve para seguir las redirecciones.
- `-z`: Sirve para indicar el tipo de dato que queremos usar de cara al reconocimiento que nos interese aplicar. Uso para jugar con extensiones: `-z list,html-txt-php`. Uso para jugar con rangos: `-z range,1-20000`
- `--hc o --sc`: código respuesta oculta `hc` o visualiza `sc` el código especificado. Podemos especificar varios códigos separándolos con comas.
- `--hl o --sl`: Por el número de líneas en la respuesta.
- `--hw o --sw`: Por número de palabras.
- `--hh o --sh`: Por numero de caracteres.
- `-X`: Permite realizar una petición con un método HTTP personalizado, como PUT o DELETE.
# BURPSUITE
**BurpSuite**. BurpSuite es una plataforma que integra características especializadas para realizar pruebas de penetración en aplicaciones web. Una de sus particularidades es la función de **análisis de páginas en línea**, empleada para identificar y enumerar los recursos accesibles en una página web.

BurpSuite cuenta con dos versiones: una **versión gratuita** (**BurpSuite Community Edition**) y una **versión de pago** (**BurpSuite Pofessional**).

### BurpSuite Community Edition

Es la **versión gratuita** de esta plataforma, viene incluida por defecto en el sistema operativo. Su función principal es desempeñar el papel de **proxy HTTP** para la aplicación, facilitando la realización de pruebas de penetración.

Un **proxy HTTP** es un filtro de contenido de alto rendimiento, ampliamente usado en el hacking con el fin de interceptar el tráfico de red. Esto permite analizar, modificar, aceptar o rechazar todas las solicitudes y respuestas de la aplicación que se esté auditando.

Algunas de las ventajas que la versión gratuita ofrecen son:

- **Gratuidad**: La versión Community Edition es gratuita, lo que la convierte en una opción accesible para principiantes y profesionales con presupuestos limitados.
- **Herramientas básicas**: Incluye las herramientas esenciales para realizar pruebas de penetración en aplicaciones web, como el Proxy, el Repeater y el Sequencer.
- **Intercepción y modificación de tráfico**: Permite interceptar y modificar las solicitudes y respuestas HTTP/HTTPS, facilitando la identificación de vulnerabilidades y la exploración de posibles ataques.
- **Facilidad de uso**: La interfaz de usuario de la Community Edition es intuitiva y fácil de utilizar, lo que facilita su adopción por parte de usuarios con diversos niveles de experiencia.
- **Aprendizaje y familiarización**: La versión gratuita permite a los usuarios aprender y familiarizarse con las funcionalidades y técnicas de pruebas de penetración antes de dar el salto a la versión Professional.
- **Comunidad de usuarios**: La versión Community Edition cuenta con una amplia comunidad de usuarios que comparten sus conocimientos y experiencias en foros y blogs, lo que puede ser de gran ayuda para resolver problemas y aprender nuevas técnicas.

A pesar de que la Community Edition no ofrece todas las funcionalidades y ventajas de la versión Professional, sigue siendo una opción valiosa para aquellos que buscan comenzar en el ámbito de las pruebas de penetración o que necesitan realizar análisis de seguridad básicos sin incurrir en costos adicionales.

# PARTE 2
# FFUF
Es una herramienta parecida a *Wfuzz*, solo que es más rápido.
```shell
./ffuf
```
- `FUZZ`: Es como el de *Wfuzz*.
# PHONEBOOK
Esta herramienta web también nos sirve para buscar por **URL**.