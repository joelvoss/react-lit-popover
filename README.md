# @react-lit/popover

## Installation

```bash
$ npm i @react-lit/popover
# or
$ yarn add @react-lit/popover
```

## Example

```js
import * as React from 'react';
import { Popover, positionDefault } from '@react-lit/popover';

function Example() {
	const ref = React.useRef(null);
	const [value, setValue] = React.useState('');
	return (
		<div>
			<label>
				<span>Type for a special message</span>
				<input
					type="text"
					ref={ref}
					onChange={event => setValue(event.target.value)}
				/>
			</label>

			{value.length > 0 && (
				<Popover targetRef={ref} position={positionDefault}>
					<div>
						<p>Whoa! Look at me!</p>
					</div>
				</Popover>
			)}
		</div>
	);
}
```

## Available position functions

- `positionDefault` _(default)_:
  Popover is positioned with it's top left corner at the bottom left corner of
  the target element.
- `positionRight`
  Popover is positioned with it's top right corner at the bottom left corner of
  the target element.
- `positionMatchWidth`
  Popover is positioned below the target element matching it's width.
- `positionCenter`
  Popover is positioned centered below the target element.

## Development

(1) Install dependencies

```bash
$ npm i
# or
$ yarn
```

(2) Run initial validation

```bash
$ ./Taskfile.sh validate
```

(3) Run tests in watch-mode to validate functionality.

```bash
$ ./Taskfile test -w
```

---

_This project was set up by @jvdx/core_
