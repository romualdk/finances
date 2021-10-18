`node convert

Usage: convert <command> [options]

Polecenia:
  convert gnucash  Convert bank transactions csv file to GnuCash csv file

Opcje:
      --version   Pokaż numer wersji                                   [boolean]
  -f, --file      Input file                                          [wymagany]
  -d, --dir       Directory                           [domyślny: "data_example"]
  -o, --output    Output file               [domyślny: "gnucash-2021-10-18.csv"]
  -k, --keywords  Keywords file                       [domyślny: "keywords.txt"]
  -a, --accounts  Accounts csv exported from GnuCash  [domyślny: "accounts.csv"]
  -h, --help      Pokaż pomoc                                          [boolean]

Przykłady:
  convert gnucash -f lista_operacji.csv  Convert using example files`