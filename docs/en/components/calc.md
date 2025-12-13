# Calculator Component Description
## Main Purpose
The CalcComponent component is an integrated calculator with two operating modes:

Main calculator - permanently displayed in the interface

Popup calculator - integrated with the form for filling in fields

## Key Features:
1. Architecture and Interfaces
CalculatorButton Interface: A unified structure for calculator buttons
```TypeScript
interface CalculatorButton {
label: string; // Display text
action: string; // Action (for logic)
color: string; // Button color (Ionic colors)
value: string; // Value to process
}
```
2. Operating Modes

Basic Mode: Standard arithmetic operations

Extended Mode: Additional mathematical functions (trigonometry, logarithms, etc.)

Switching via toggleMode() and isExtendedMode

3. Multilingualism (i18n)
Automatic update when changing languages

4. Dual Interface
Main Calculator
Popup Calculator
Single processing logic for both interfaces

## Critical Logic:
1. Mathematical Expression Processing

```typescript
private calculateLogic(expr: string): string
```

Safe Calculation via new Function()
Support for Mathematical Functions via Conversion to Math.*
Error Handling and Rounding of Results
2. Bracket Management

```typescript
private toggleBracketsLogic(expr: string): string
```

Intelligent Bracket Addition
Balancing Opening/closing parentheses
Automatic insertion of the multiplication operator before the parenthesis

3. Percentage Calculations

```TypeScript
private percentageLogic(expr: string): string
```

Processing percentages of the last number
Support for percentages of the entire expression

4. Keyboard Handling

```TypeScript
@HostListener('document:keydown', ['$event'])
```

Full keyboard input support
Hotkeys (Enter, Escape, Backspace)
Character conversion (^ -> **)

### Data Flows:
Two main states:

- Main expression (expression)
- for the main calculator
- Popup expression (popupExpression) - for the form

Form Integration:
- inputValue - form input field value
- applyCalculation() - transfer the result from the popup to the form
- clearForm() - clear the form field

### Security and Handling Errors:
Important measures:
- Safe eval: Use new Function() instead of eval()
- Result validation: Check isFinite() and isNaN()
- Expression standardization: Replace non-standard characters
### Performance:
- Button separation: Separate arrays for basic/advanced modes
- Memoization: getCurrentButtons() for dynamic button selection

### Stylistic features:
- Use of Ionic components (ion-button, ion-card, ion-segment)
- Responsive layout (ion-grid with column layout)
- Semantic color scheme:

primary - main action (=)

danger - clearing (C)

warning - operators (+, -, *, /)

tertiary - advanced functions

## Summary of key benefits:
### Flexibility
Two calculator modes (basic/advanced)
Two interfaces
Full keyboard navigation

### Security
Protected expression evaluation
Comprehensive error handling
Validation of mathematical operations
### Integration
Ready for use in forms
Multilingual support
Responsive design

### Supportability
Clear separation of logic
Modular button structure
Commented and structured code

# Suggestions for improvement:
- Implement calculation history
- Add theme support (dark/light mode)
- Add more functions and buttons to the advanced mode
>The component is a well-thought-out and comprehensive solution that combines mathematical functionality, a user-friendly interface, and secure operation execution.