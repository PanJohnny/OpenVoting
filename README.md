# OpenVoting
Otevřený hlasovací systém, který umožňuje anonymní i neanonymní hlasování. Pokouší se zajistit transparentnost, ale zároveň anonymitu hlasujících, a to aby i člověk s přístupem k databázi neměl být schopný zjistit vaše data.

> [!NOTE]
> Tento projekt by měl být používaný pouze pro nedůležité ankety. Zabezpečení může správce serveru obejít úpravou zdrojového kódu. Vše co zde vidíte je bez záruky a odpovědnosti.

## Jak spustit?
Cloneněte si tento repozitář a spusťte docker compose build, následně pomocí docker compose up zapnete stránku a databázi. Pokud hostujete databázi na jiném serveru nastavte environment variable POSTGRES_HOST na příslušnou IP adresu. Porty konfigurovatelné v docker-compose.yml - základní 4321, můžete změnit na 80 pro http.

## Technické informace
* PostgreSQL
* NodeJS s velmi rychlím frameworkem Astro.js
* Docker

## Výpomoc
Určitě k tomuto projektu přispějte, byl to můj víkendový projekt. Budu enormně rád.

Tento projekt není vhodný k produkčnímu nasazení. Některé jeho části nejsou dodělány, ale je z naprosté většiny funkční.