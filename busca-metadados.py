import requests

query = "molecular docking AND cancer"
url = (
    "https://www.ebi.ac.uk/europepmc/webservices/rest/search"
    "?query=" + query +
    "&resultType=core&format=json"
)

# query completa: https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=molecular%20docking%20AND%20cancer&resultType=core&format=json

response = requests.get(url)
data = response.json()

# Mostrar os 3 primeiros resultados
for result in data["resultList"]["result"][:3]:
    print("Título:", result.get("title"))
    print("Autores:", ", ".join(a["fullName"] for a in result.get("authorList", {}).get("author", [])))
    print("Ano:", result.get("pubYear"))
    print("Licença:", result.get("license"))
    print("PMCID:", result.get("pmcid"))
    print("Link para o artigo no PMC:", result.get("fullTextUrlList", {}).get("fullTextUrl", [{}])[0].get("url"))
    print("-" * 80)
