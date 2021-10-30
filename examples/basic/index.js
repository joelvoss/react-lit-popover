import { useRef, useState } from 'react';
import { Popover, positionMatchWidth, positionDefault } from '../../src/index';

export function Example() {
	const ref = useRef();
	const [value, setValue] = useState('');

	return (
		<>
			<h2>Example: Basic</h2>
			<div>
				<textarea placeholder="1. Resize me to move stuff around" />
				<textarea
					placeholder="2. Try typing 'match width'"
					ref={ref}
					onChange={event => setValue(event.target.value)}
				/>
				{value.length > 0 && (
					<Popover
						targetRef={ref}
						position={
							value === 'match width' ? positionMatchWidth : positionDefault
						}
					>
						<div
							style={{
								border: 'solid 1px',
								padding: 10,
								background: 'white',
								maxWidth: 400,
							}}
						>
							<p>Surprise!</p>
							<p>
								Tab navigation from the textarea that triggered this should now
								move to the button below.
							</p>
							<button>I should be the next tab</button>
						</div>
					</Popover>
				)}
				<button>and then tab to me after that one</button>
			</div>
		</>
	);
}
