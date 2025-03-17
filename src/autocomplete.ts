/**
 * Enhanced Autocomplete Library
 * A lightweight autocomplete implementation for vanilla JavaScript with TypeScript support
 * Now with object data support, multiple display properties, and HTML formatting
 */

// Define the generic type for suggestion items
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

export class Autocomplete<T extends AutocompleteSuggestion> {
  private options: Required<AutocompleteOptions<T>>;
  private container: HTMLDivElement;
  private suggestions: T[] = [];
  private activeIndex: number = -1;
  private debounceTimer: number | null = null;
  private wrapper: HTMLDivElement | null = null;
  private dropdownIcon: HTMLDivElement | null = null;
  
  constructor(options: AutocompleteOptions<T>) {
    // Set default options with basic formatSelectedItem function
    this.options = {
      maxSuggestions: 5,
      minChars: 2,
      debounceTime: 300,
      containerClass: 'autocomplete-container',
      suggestionClass: 'autocomplete-suggestion',
      activeClass: 'autocomplete-suggestion-active',
      onSelect: () => {},
      showDropdownIcon: false,
      dropdownIconClass: 'autocomplete-dropdown-icon',
      dropdownIconHtml: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
      allowHTML: false,
      formatSuggestionHTML: (item) => this.options.formatSelectedItem(item),
      sanitizeHTML: (html) => this.sanitizeDefaultHTML(html),
      renderSuggestion: (suggestion, element) => {
        if (this.options.allowHTML) {
          // Use HTML content for suggestions
          const htmlContent = this.options.formatSuggestionHTML(suggestion);
          element.innerHTML = this.options.sanitizeHTML(htmlContent);
        } else {
          // Use text content only
          element.textContent = this.options.formatSelectedItem(suggestion);
        }
      },
      ...options
    };
    
    // Create suggestions container
    this.container = document.createElement('div');
    this.container.className = this.options.containerClass;
    this.container.style.position = 'absolute';
    this.container.style.display = 'none';
    this.container.setAttribute('role', 'listbox');
    
    // Add container to DOM
    document.body.appendChild(this.container);
    
    // Setup dropdown icon if enabled
    if (this.options.showDropdownIcon) {
      this.setupDropdownIcon();
    }
    
    // Setup event listeners
    this.setupEventListeners();
  }
  
  // Default HTML sanitizer - very basic
  private sanitizeDefaultHTML(html: string): string {
    // This is a simple sanitizer that removes script tags
    // For production use, consider using a library like DOMPurify
    return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
  
  private setupDropdownIcon(): void {
    const { inputElement } = this.options;
    
    // Create wrapper element
    this.wrapper = document.createElement('div');
    this.wrapper.className = 'autocomplete-wrapper';
    this.wrapper.style.position = 'relative';
    this.wrapper.style.display = 'inline-block';
    
    // Get computed styles of input
    const inputStyle = window.getComputedStyle(inputElement);
    
    // Set wrapper dimensions to match input
    this.wrapper.style.width = inputStyle.width;
    
    // Insert wrapper before input in the DOM
    inputElement.parentNode?.insertBefore(this.wrapper, inputElement);
    
    // Move input inside wrapper
    this.wrapper.appendChild(inputElement);
    
    // Create dropdown icon
    this.dropdownIcon = document.createElement('div');
    this.dropdownIcon.className = this.options.dropdownIconClass;
    this.dropdownIcon.innerHTML = this.options.dropdownIconHtml;
    this.dropdownIcon.style.position = 'absolute';
    this.dropdownIcon.style.right = '10px';
    this.dropdownIcon.style.top = '50%';
    this.dropdownIcon.style.transform = 'translateY(-50%)';
    this.dropdownIcon.style.pointerEvents = 'none';
    
    // Add icon to wrapper
    this.wrapper.appendChild(this.dropdownIcon);
    
    // Add padding to input to prevent text overlap with icon
    inputElement.style.paddingRight = '30px';
  }
  
  private updateContainerPosition(): void {
    const inputRect = this.options.inputElement.getBoundingClientRect();
    const containerHeight = this.container.offsetHeight;
    
    // Calculate available space below and above the input
    const spaceBelow = window.innerHeight - inputRect.bottom;
    const spaceAbove = inputRect.top;
    
    this.container.style.width = `${inputRect.width}px`;
    this.container.style.left = `${inputRect.left + window.scrollX}px`;
    
    // Determine if container should appear above or below the input
    if (spaceBelow < containerHeight && spaceAbove > spaceBelow) {
      // Position above the input
      this.container.style.top = `${inputRect.top + window.scrollY - containerHeight}px`;
      this.container.classList.add('autocomplete-above');
      this.container.classList.remove('autocomplete-below');
    } else {
      // Position below the input (default)
      this.container.style.top = `${inputRect.bottom + window.scrollY}px`;
      this.container.classList.add('autocomplete-below');
      this.container.classList.remove('autocomplete-above');
    }
  }
  
  private setupEventListeners(): void {
    const { inputElement } = this.options;
    
    // Input event
    inputElement.addEventListener('input', this.handleInput.bind(this));
    
    // Focus event
    inputElement.addEventListener('focus', this.handleInput.bind(this));
    
    // Blur event
    inputElement.addEventListener('blur', () => {
      // Small delay to allow click on suggestion
      setTimeout(() => this.hide(), 150);
    });
    
    // Click event for dropdown icon (if present)
    if (this.dropdownIcon) {
      // Make the icon clickable
      this.dropdownIcon.style.pointerEvents = 'auto';
      this.dropdownIcon.style.cursor = 'pointer';
      
      this.dropdownIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        inputElement.focus();
        if (this.container.style.display === 'none') {
          this.handleInput();
        } else {
          this.hide();
        }
      });
    }
    
    // Key navigation
    inputElement.addEventListener('keydown', this.handleKeyDown.bind(this));
    
    // Window resize and scroll
    window.addEventListener('resize', this.handlePositionUpdate.bind(this));
    window.addEventListener('scroll', this.handlePositionUpdate.bind(this));
  }

  private handlePositionUpdate(): void {
    if (this.container.style.display !== 'none') {
      this.updateContainerPosition();
    }
  }
  
  private async handleInput(): Promise<void> {
    const { inputElement, minChars, debounceTime } = this.options;
    const value = inputElement.value.trim();
    
    // Clear any existing timeout
    if (this.debounceTimer !== null) {
      window.clearTimeout(this.debounceTimer);
    }
    
    // If dropdown icon is clicked with empty input, show all suggestions
    if (value.length === 0 && document.activeElement === inputElement) {
      this.debounceTimer = window.setTimeout(async () => {
        try {
          this.suggestions = await Promise.resolve(this.options.getSuggestions(''));
          
          // Limit to max suggestions
          this.suggestions = this.suggestions.slice(0, this.options.maxSuggestions);
          
          if (this.suggestions.length > 0) {
            this.render();
            this.show();
          } else {
            this.hide();
          }
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          this.hide();
        }
      }, debounceTime);
      return;
    }
    
    // Hide suggestions if input is too short
    if (value.length < minChars) {
      this.hide();
      return;
    }
    
    // Debounce the input
    this.debounceTimer = window.setTimeout(async () => {
      try {
        this.suggestions = await Promise.resolve(this.options.getSuggestions(value));
        
        // Limit to max suggestions
        this.suggestions = this.suggestions.slice(0, this.options.maxSuggestions);
        
        if (this.suggestions.length > 0) {
          this.render();
          this.show();
        } else {
          this.hide();
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        this.hide();
      }
    }, debounceTime);
  }
  
  private handleKeyDown(event: KeyboardEvent): void {
    const { key } = event;
    
    // Only handle keys if suggestions are visible
    if (this.container.style.display === 'none') {
      return;
    }
    
    switch (key) {
      case 'ArrowDown':
        event.preventDefault();
        this.activeIndex = Math.min(this.activeIndex + 1, this.suggestions.length - 1);
        this.highlightActive();
        break;
        
      case 'ArrowUp':
        event.preventDefault();
        this.activeIndex = Math.max(this.activeIndex - 1, -1);
        this.highlightActive();
        break;
        
      case 'Enter':
        if (this.activeIndex >= 0) {
          event.preventDefault();
          this.selectSuggestion(this.suggestions[this.activeIndex]);
        }
        break;
        
      case 'Escape':
        event.preventDefault();
        this.hide();
        break;
        
      default:
        break;
    }
  }
  
  private render(): void {
    // Clear container
    this.container.innerHTML = '';
    this.activeIndex = -1;
    
    // Create suggestion elements
    this.suggestions.forEach((suggestion, index) => {
      const element = document.createElement('div');
      element.className = this.options.suggestionClass;
      element.setAttribute('role', 'option');
      
      // Use custom renderer if provided
      this.options.renderSuggestion(suggestion, element);
      
      element.addEventListener('click', () => this.selectSuggestion(suggestion));
      element.addEventListener('mouseenter', () => {
        this.activeIndex = index;
        this.highlightActive();
      });
      
      this.container.appendChild(element);
    });
  }
  
  private highlightActive(): void {
    const items = this.container.querySelectorAll(`.${this.options.suggestionClass}`);
    
    items.forEach((item, index) => {
      if (index === this.activeIndex) {
        item.classList.add(this.options.activeClass);
        // Scroll into view if needed
        if (item.scrollIntoView) {
          item.scrollIntoView({ block: 'nearest' });
        }
      } else {
        item.classList.remove(this.options.activeClass);
      }
    });
  }
  
  private selectSuggestion(suggestion: T): void {
    // Update the input with the formatted value from multiple properties
    this.options.inputElement.value = this.options.formatSelectedItem(suggestion);
    
    // Pass the entire object to the onSelect callback
    this.options.onSelect(suggestion);
    this.hide();
  }
  
  private show(): void {
    // First display the container so we can get its height for positioning
    this.container.style.display = 'block';
    // Then update position based on available space
    this.updateContainerPosition();
    
    // Rotate icon if present
    if (this.dropdownIcon) {
      this.dropdownIcon.classList.add('autocomplete-icon-active');
    }
  }
  
  private hide(): void {
    this.container.style.display = 'none';
    this.activeIndex = -1;
    
    // Reset icon rotation if present
    if (this.dropdownIcon) {
      this.dropdownIcon.classList.remove('autocomplete-icon-active');
    }
  }
  
  public destroy(): void {
    const { inputElement } = this.options;
    
    // If we created a wrapper, we need to unwrap the input
    if (this.wrapper) {
      // Remove added styles from input
      inputElement.style.paddingRight = '';
      
      // Get the parent of our wrapper
      const parent = this.wrapper.parentNode;
      
      // Move the input back to its original location
      if (parent) {
        parent.insertBefore(inputElement, this.wrapper);
        // Remove the wrapper
        parent.removeChild(this.wrapper);
      }
    }
    
    // Remove container from DOM
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    
    // Remove event listeners
    inputElement.removeEventListener('input', this.handleInput.bind(this));
    inputElement.removeEventListener('focus', this.handleInput.bind(this));
    inputElement.removeEventListener('keydown', this.handleKeyDown.bind(this));
    window.removeEventListener('resize', this.handlePositionUpdate.bind(this));
  }
}
