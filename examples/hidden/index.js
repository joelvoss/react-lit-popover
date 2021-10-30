import { useCallback, useRef, useState } from 'react';
import { Popover } from '../../src/index';

export function Example() {
	const ref = useRef(null);
	const [open, setOpen] = useState(false);
	const updateOpen = useCallback(
		e => {
			setOpen(e.target.checked);
		},
		[setOpen],
	);

	return (
		<>
			<h2>Example: Hidden</h2>
			<div>
				<textarea placeholder="1. Resize me to move stuff around" />
				<label style={{ display: 'inline-block' }}>
					<input ref={ref} type="checkbox" onChange={updateOpen} />
					Open popover
				</label>
				<Popover hidden={!open} targetRef={ref}>
					<div
						style={{
							backgroundColor: '#FFF',
							border: '1px solid #333',
							padding: '0 1em',
							borderRadius: '0.5em',
							maxWidth: '15em',
						}}
					>
						<p>
							Wow, popover content! It's still in the DOM, even when it's not
							visible.
						</p>
						<p>
							<i style={{ opacity: 0.8 }}>
								Lorem ipsum dolor sit amet, consectetur adipiscing elit.
							</i>
						</p>
						<p>
							<button>I should be the next tab</button>
						</p>
					</div>
				</Popover>
				<button>and then tab to me after that one</button>
			</div>
		</>
	);
}
