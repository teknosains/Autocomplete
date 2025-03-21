# Autocomplete (TypeScript)

A simple implementation of Autocomplete search using typescript

<img width="463" alt="Screenshot 2025-03-17 at 09 38 47" src="https://github.com/user-attachments/assets/3fcf1e88-b531-401c-be38-d00f24bda9aa" />


### Demo
[JS Autocomplete](https://stackblitz.com/edit/vitejs-vite-m4vk7eud)

### Usage example

```html
 <input 
    type="text" 
    id="input-country" 
    class="your-own-style"
    placeholder="Search for a country..."
    autocomplete="off"
 />
```

```javascript
import './style.css'
import { Autocomplete } from './autocomplete.ts'

const countries = [
  { name: "United States", id: 1 },
  { name: "United Kingdom", id: 2 },
  { name: "Canada", id: 3 },
  { name: "Australia", id: 4 },
  { name: "Germany", id: 5 }
];

const countrySearchInput = document.querySelector(
  "#input-country"
) as HTMLInputElement;

const selected = document.querySelector("#selected");

const userAutocomplete = new Autocomplete({
  inputElement: countrySearchInput,
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
```

### Ajax Example
```javascript
const userAutocomplete = new Autocomplete({
  inputElement: countrySearchInput,
  formatSelectedItem: (country) => {
    return country.name;
  },
  // want HTML formatted dropdown? enable this
  allowHTML: true,
  formatSuggestionHTML: (country) => {
    return `${country.name} <i>ID: ${country.id}</i>`;
  },
  getSuggestions: async (input) => {
    if (!input) return [];

    const response = await fetch(`/api/country?search=${input}`);
    const data = await response.json();

    return data.filter((item: any) => 
      item.name.toLowerCase().includes(input.toLowerCase())
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
```

### Usage in VanillaJS

load the ```autocomplete.js``` file. (see ```src/autocomplete.js```)

```javascript
<script src="/path/to/autocomplete.js"></script>
```

```javascript
const userAutocomplete = new Autocomplete({
 // the rest is the same...
});
```

### available configs
```javascript
export interface AutocompleteSuggestion {
  [key: string]: any;
}

export interface AutocompleteOptions<T extends AutocompleteSuggestion> {
  /** The input element to attach the autocomplete to */
  inputElement: HTMLInputElement;
  /** Function that returns suggestions based on the current input */
  getSuggestions: (input: string) => Promise<T[]> | T[];
  /** Format function to determine what's displayed in the input after selection */
  formatSelectedItem: (item: T) => string;
  /** Format function to determine HTML content for suggestions (optional) */
  formatSuggestionHTML?: (item: T) => string;
  /** Maximum number of suggestions to display */
  maxSuggestions?: number;
  /** Minimum characters required to trigger suggestions */
  minChars?: number;
  /** Delay in milliseconds before triggering the suggestions */
  debounceTime?: number;
  /** CSS class for the suggestions container */
  containerClass?: string;
  /** CSS class for suggestion items */
  suggestionClass?: string;
  /** CSS class for the active suggestion */
  activeClass?: string;
  /** Callback when a suggestion is selected */
  onSelect?: (value: T) => void;
  /** Whether to add a dropdown icon to the input */
  showDropdownIcon?: boolean;
  /** CSS class for the dropdown icon */
  dropdownIconClass?: string;
  /** Custom HTML for the dropdown icon (default is a down arrow) */
  dropdownIconHtml?: string;
  /** Whether to allow HTML in suggestions */
  allowHTML?: boolean;
  /** Sanitize HTML content (recommended when allowing HTML) */
  sanitizeHTML?: (html: string) => string;
  /** Custom renderer for suggestion items (optional) */
  renderSuggestion?: (suggestion: T, element: HTMLElement) => void;
}
```

### Disclaimer
> 90% is written by AI Claude.ai by @anthropics. Some areas might need more improvement and testing
