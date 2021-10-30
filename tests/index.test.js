import * as React from 'react';
import { render } from './test-utils';
import { axe } from 'jest-axe';

import {
	Popover,
	positionDefault,
	positionMatchWidth,
	positionRight,
} from '../src/index';

describe('<Popover />', () => {
	it('should not have ARIA violations', async () => {
		const Element = () => {
			const ref = React.useRef(null);
			return (
				<div>
					<div ref={ref} />
					<Popover targetRef={ref}>
						<div>I'm inside a popover!</div>
					</Popover>
				</div>
			);
		};

		let { container } = render(<Element />);
		expect(await axe(container)).toHaveNoViolations();
	});

	it(`should render a popover`, async () => {
		const Element = () => {
			const ref = React.useRef(null);
			return (
				<div>
					<div ref={ref} />
					<Popover targetRef={ref}>
						<div>I'm inside a popover!</div>
					</Popover>
				</div>
			);
		};

		const { baseElement } = render(<Element />);
		expect(baseElement).toMatchSnapshot();
	});

	it(`should render a popover with a different position`, async () => {
		const Element = () => {
			const ref = React.useRef(null);
			return (
				<div>
					<div ref={ref} />
					<Popover targetRef={ref} position={positionMatchWidth}>
						<div>I'm inside a popover!</div>
					</Popover>
				</div>
			);
		};

		const { baseElement } = render(<Element />);
		expect(baseElement).toMatchSnapshot();
	});
});

describe('positionDefault', () => {
	it('should calculate the correct css position', () => {
		const targetRect = {
			bottom: 390,
			height: 17,
			left: 1065,
			right: 1170,
			top: 373,
			width: 105,
			x: 1065,
			y: 373,
		};

		const popoverRect = {
			bottom: 230,
			height: 24,
			left: 1065,
			right: 1385,
			top: 206,
			width: 320,
			x: 1065,
			y: 206,
		};

		expect(positionDefault(targetRect, popoverRect)).toEqual({
			left: '850px',
			top: '390px',
		});
	});
});

describe('positionMatchWidth', () => {
	it('should calculate the correct css position', () => {
		const targetRect = {
			bottom: 390,
			height: 17,
			left: 1065,
			right: 1170,
			top: 373,
			width: 105,
			x: 1065,
			y: 373,
		};

		const popoverRect = {
			bottom: 230,
			height: 24,
			left: 1065,
			right: 1385,
			top: 206,
			width: 320,
			x: 1065,
			y: 206,
		};

		expect(positionMatchWidth(targetRect, popoverRect)).toEqual({
			left: '1065px',
			top: '390px',
			width: '105px',
		});
	});
});

describe('positionRight', () => {
	it('should calculate the correct css position', () => {
		const targetRect = {
			bottom: 390,
			height: 17,
			left: 1065,
			right: 1170,
			top: 373,
			width: 105,
			x: 1065,
			y: 373,
		};

		const popoverRect = {
			bottom: 230,
			height: 24,
			left: 1065,
			right: 1385,
			top: 206,
			width: 320,
			x: 1065,
			y: 206,
		};

		expect(positionRight(targetRect, popoverRect)).toEqual({
			left: '850px',
			top: '390px',
		});
	});
});
