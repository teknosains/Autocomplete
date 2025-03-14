import './style.css'
import { Autocomplete } from './autocomplete.ts'

const countries = [
  { name: "United States", id: 1 },
  { name: "United Kingdom", id: 2 },
  { name: "Canada", id: 3 },
  { name: "Australia", id: 4 },
  { name: "Germany", id: 5 }
];

const productSearchInput = document.querySelector(
  "#input-country"
) as HTMLInputElement;

const selected = document.querySelector("#selected");

const userAutocomplete = new Autocomplete({
  inputElement: productSearchInput,
  displayProperty: 'name',
  getSuggestions: async (input) => {
    if (!input) return [];
    
    // this could be from you database
    return countries.filter(country => 
      country.name.toLowerCase().includes(input.toLowerCase())
    );
  },
  minChars: 1,
  debounceTime: 300,
  maxSuggestions: 10,
  onSelect: (value) => {
    console.log(value);
    selected.innerHTML = JSON.stringify(value);
  }
});