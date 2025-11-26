import cities from "../datas/communes.json"
export default function triggerAutoComplete(text){
    let foundCities = []
    if (text.length < 3) return foundCities;
    const cityText = normalizeCityName(text)
    const filteredCities = cities.filter(item => item.TYPECOM === "COM" || item.TYPECOM === "ARM");
    
    for (const c of filteredCities) {
        if(c.LIBELLE.includes(cityText)) 
            foundCities.push({id: c.COM ,libelle: c.LIBELLE, postcode: c.DEP})
    }
    console.log(foundCities);
    return foundCities;
}

export function cityExists(city){
    console.log("City text : ", city)
    const cityText = normalizeCityName(city)
    console.log("City text normalized : ", cityText)
    const filteredCities = cities.filter(item => item.TYPECOM === "COM" || item.TYPECOM === "ARM");
    
    for (const c of filteredCities) {
        if(c.LIBELLE===cityText)
            return true
    }
    return false
}

export function normalizeCityName(text) {
  if (!text) return "";

  return text
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map(word => {
      return word
        .split("-")
        .map(part => {
          if (part.length === 0) return part;
          return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
        })
        .join("-");
    })
    .join(" ");
}
