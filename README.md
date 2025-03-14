# Autocomplete (TypeScript)

A super simple implementation of Autocomplete search using typescript

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
  /** Property name to display in the input (e.g., 'name') */
  displayProperty: keyof T;
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
  /** Custom renderer for suggestion items (optional) */
  renderSuggestion?: (suggestion: T, element: HTMLElement) => void;
}
```