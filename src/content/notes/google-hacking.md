---
# Google Hacking
**Date**: `05-10-2026`
---

El ‘**Google Dork**‘ es una técnica de búsqueda avanzada que utiliza operadores y palabras clave específicas en el buscador de Google para encontrar información que normalmente no aparece en los resultados de búsqueda regulares.

## PENTEST TOOLS
https://pentest-tools.com/
Esta página nos puede servir para usar múltiples Dorks, en la pestaña Google Hacking. Pero también tenemos muchas más como para enumerar subdominios.

## EXPLOIT DB
Esta web recopila vulnerabilidades  y también lo podemos usar para Google Hacking, podemos acceder desde la web, pero también podemos usar una herramienta que nos sirve para buscar en ella, su nombre es `searchsploit`.

## DORKS
- `site:tinder.com`: Sirve para buscar en un determinado sitio.
- `filetype:txt`: Sirve para buscar solo por archivos con extensión `.txt`.
- `intext:tinder.com`: Sirve para que las respuestas que encuentre, no necesariamente tienen que ser de este dominio, sino que le estamos diciendo que la entrada tiene que ser el dominio.

## EXIFTOOL
Nos sirve para ver si hay metadatos en archivos.
```shell
exiftool whoami.pdf
```