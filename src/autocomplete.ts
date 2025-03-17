import './style.css';
import { Autocomplete } from './autocomplete.ts';

const countries = [
  { name: 'United States', id: 1 },
  { name: 'United Kingdom', id: 2 },
  { name: 'Canada', id: 3 },
  { name: 'Australia', id: 4 },
  { name: 'Germany', id: 5 },
];

const productSearchInput = document.querySelector(
  '#input-country'
) as HTMLInputElement;

const selected = document.querySelector('#selected');

new Autocomplete({
  inputElement: productSearchInput,
  formatSelectedItem: (country) => {
    return country.name;
  },
  allowHTML: true,
  formatSuggestionHTML: (country) => {
    return `${country.name} <i>ID: ${country.id}</i>`;
  },
  getSuggestions: async (input) => {
    if (!input) return [];

    // this could be from you database
    return countries.filter((country) =>
      country.name.toLowerCase().includes(input.toLowerCase())
    );
  },
  minChars: 1,
  debounceTime: 300,
  maxSuggestions: 10,
  onSelect: (value) => {
    console.log(value);
    if (selected) selected.innerHTML = JSON.stringify(value);
  },
});
