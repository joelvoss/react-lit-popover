import * as React from 'react';
import { Portal } from '@react-lit/portal';
import { useRect } from '@react-lit/rect';
import { getOwnerDocument, useComposeRefs, tabbable } from '@react-lit/helper';

////////////////////////////////////////////////////////////////////////////////

/** @typedef {import('@react-lit/rect').PRect} PRect */

/** @typedef {null | undefined | HTMLElement | SVGElement} PossibleNode */

/**
 * @typedef {(
 *   targetRect: PRect | null,
 *   popoverRect: PRect | null,
 *   unstableObserverableNodes: Array<PossibleNode>
 * ) => React.CSSProperties} Position
 */

/**
 * @typedef {Object} Collision
 * @prop {boolean} directionRight
 * @prop {boolean} directionLeft
 * @prop {boolean} directionUp
 * @prop {boolean} directionDown
 */

////////////////////////////////////////////////////////////////////////////////

/**
 * @typedef {Object} PopoverProps
 * @prop {string} [as]
 * @prop {React.RefObject<PossibleNode>} targetRef
 * @prop {Position} [position]
 * @prop {boolean} [hidden]
 * @prop {React.RefObject<PossibleNode>[]} [observableRefs]
 * @prop {React.CSSProperties} [style]
 * @prop {string} [className]
 */

/**
 * Popover
 * @param {React.PropsWithChildren<PopoverProps>} props
 * @param {React.MutableRefObject} [ref]
 */
function _Popover(props, ref) {
	return (
		<Portal>
			<PopoverImpl ref={ref} {...props} />
		</Portal>
	);
}

export const Popover = React.forwardRef(_Popover);

////////////////////////////////////////////////////////////////////////////////

/**
 * PopoverImpl is conditionally rendered so we can't start measuring until it
 * shows up, so useRect needs to live down here not up in Popover.
 */
const PopoverImpl = React.forwardRef(
	(
		{
			as: Comp = 'div',
			targetRef,
			position = positionDefault,
			observableRefs = [],
			...props
		},
		forwardedRef,
	) => {
		const popoverRef = React.useRef(null);
		const popoverRect = useRect(popoverRef, { observe: !props.hidden });
		const targetRect = useRect(targetRef, { observe: !props.hidden });
		const ref = useComposeRefs(popoverRef, forwardedRef);

		useSimulateTabNavigationForReactTree(targetRef, popoverRef);

		return (
			<Comp
				ref={ref}
				{...props}
				style={{
					position: 'absolute',
					...getStyles(position, targetRect, popoverRect, ...observableRefs),
					...props.style,
				}}
			/>
		);
	},
);

////////////////////////////////////////////////////////////////////////////////

/**
 * getStyles
 * @param {Position} position
 * @param {PRect | null} targetRect
 * @param {PRect | null} popoverRect
 * @param  {Array<React.RefObject<PossibleNode>>} observableRefs
 * @returns {React.CSSProperties}
 */
function getStyles(position, targetRect, popoverRect, ...observableRefs) {
	return popoverRect
		? position(
				targetRect,
				popoverRect,
				...observableRefs.map(ref => ref.current),
		  )
		: { visibility: 'hidden' };
}

////////////////////////////////////////////////////////////////////////////////

/**
 * getTopPosition
 * @param {PRect} targetRect
 * @param {PRect} popoverRect
 * @param {boolean} isDirectionUp
 * @returns {{ top: string }}
 */
function getTopPosition(targetRect, popoverRect, isDirectionUp) {
	return {
		top: isDirectionUp
			? `${targetRect.top - popoverRect.height + window.pageYOffset}px`
			: `${targetRect.top + targetRect.height + window.pageYOffset}px`,
	};
}

////////////////////////////////////////////////////////////////////////////////

/**
 * positionDefault
 * @param {PRect | null} targetRect
 * @param {PRect | null} popoverRect
 * @returns {{ left: string, top: string }}
 */
export function positionDefault(targetRect, popoverRect) {
	if (!targetRect || !popoverRect) {
		return {};
	}

	const { directionRight, directionUp } = getCollisions(
		targetRect,
		popoverRect,
	);
	return {
		left: directionRight
			? `${targetRect.right - popoverRect.width + window.pageXOffset}px`
			: `${targetRect.left + window.pageXOffset}px`,
		...getTopPosition(targetRect, popoverRect, directionUp),
	};
}

////////////////////////////////////////////////////////////////////////////////

/**
 * positionRight
 * @param {PRect | null} targetRect
 * @param {PRect | null} popoverRect
 * @returns {{ left: string, top: string }}
 */
export function positionRight(targetRect, popoverRect) {
	if (!targetRect || !popoverRect) {
		return {};
	}

	const { directionLeft, directionUp } = getCollisions(targetRect, popoverRect);
	return {
		left: directionLeft
			? `${targetRect.left + window.pageXOffset}px`
			: `${targetRect.right - popoverRect.width + window.pageXOffset}px`,
		...getTopPosition(targetRect, popoverRect, directionUp),
	};
}

////////////////////////////////////////////////////////////////////////////////

/**
 * positionMatchWidth
 * @param {PRect | null} targetRect
 * @param {PRect | null} popoverRect
 * @returns {{ width: number, left: number, top: string }}
 */
export function positionMatchWidth(targetRect, popoverRect) {
	if (!targetRect || !popoverRect) {
		return {};
	}

	const { directionUp } = getCollisions(targetRect, popoverRect);
	return {
		width: `${targetRect.width}px`,
		left: `${targetRect.left}px`,
		...getTopPosition(targetRect, popoverRect, directionUp),
	};
}

////////////////////////////////////////////////////////////////////////////////

/**
 * getCollisions
 * @param {PRect} targetRect
 * @param {PRect} popoverRect
 * @param {number} [offsetLeft=0]
 * @param {number} [offsetBottom=0]
 * @returns {Collision}
 */
function getCollisions(
	targetRect,
	popoverRect,
	offsetLeft = 0,
	offsetBottom = 0,
) {
	const collisions = {
		top: targetRect.top - popoverRect.height < 0,
		right: window.innerWidth < targetRect.left + popoverRect.width - offsetLeft,
		bottom:
			window.innerHeight <
			targetRect.bottom + popoverRect.height - offsetBottom,
		left: targetRect.left + targetRect.width - popoverRect.width < 0,
	};

	const directionRight = collisions.right && !collisions.left;
	const directionLeft = collisions.left && !collisions.right;
	const directionUp = collisions.bottom && !collisions.top;
	const directionDown = collisions.top && !collisions.bottom;

	return { directionRight, directionLeft, directionUp, directionDown };
}

////////////////////////////////////////////////////////////////////////////////

/**
 * useSimulateTabNavigationForReactTree scopes the tab order to the React
 * element tree, instead of the DOM tree. This way, when the user navigates
 * with tab from the targetRef, the tab order moves into the popup, and then
 * out of the popup back to the rest of the document.
 * @param {React.RefObject<T>} triggerRef
 * @param {React.RefObject<P>} popoverRef
 * @template {HTMLElement} T
 * @template {HTMLElement} P
 */
function useSimulateTabNavigationForReactTree(triggerRef, popoverRef) {
	const ownerDocument = getOwnerDocument(triggerRef.current);

	React.useEffect(() => {
		/**
		 * handleKeyDown
		 * @param {KeyboardEvent} event
		 * @returns
		 */
		function handleKeyDown(event) {
			if (
				event.key === 'Tab' &&
				popoverRef.current &&
				tabbable(popoverRef.current).length === 0
			) {
				return;
			}

			if (event.key === 'Tab' && event.shiftKey) {
				if (shiftTabbedFromElementAfterTrigger(event)) {
					focusLastTabbableInPopover(event);
				} else if (shiftTabbedOutOfPopover(event)) {
					focusTriggerRef(event);
				} else if (shiftTabbedToBrowserChrome(event)) {
					disableTabbablesInPopover();
				}
			} else if (event.key === 'Tab') {
				if (tabbedFromTriggerToPopover()) {
					focusFirstPopoverTabbable(event);
				} else if (tabbedOutOfPopover()) {
					focusTabbableAfterTrigger(event);
				} else if (tabbedToBrowserChrome(event)) {
					disableTabbablesInPopover();
				}
			}
		}

		/**
		 * tabbedFromTriggerToPopover
		 * @returns {boolean}
		 */
		function tabbedFromTriggerToPopover() {
			return triggerRef.current
				? triggerRef.current === ownerDocument.activeElement
				: false;
		}

		/**
		 * focusFirstPopoverTabbable
		 * @param {KeyboardEvent} event
		 */
		function focusFirstPopoverTabbable(event) {
			const elements = popoverRef.current && tabbable(popoverRef.current);
			if (elements && elements[0]) {
				event.preventDefault();
				elements[0].focus();
			}
		}

		/**
		 * tabbedOutOfPopover
		 * @returns {boolean}
		 */
		function tabbedOutOfPopover() {
			const inPopover = popoverRef.current
				? popoverRef.current.contains(ownerDocument.activeElement || null)
				: false;
			if (inPopover) {
				const elements = popoverRef.current && tabbable(popoverRef.current);
				return Boolean(
					elements &&
						elements[elements.length - 1] === ownerDocument.activeElement,
				);
			}
			return false;
		}

		/**
		 * focusTabbableAfterTrigger
		 * @param {KeyboardEvent} event
		 */
		function focusTabbableAfterTrigger(event) {
			const elementAfterTrigger = getElementAfterTrigger();
			if (elementAfterTrigger) {
				event.preventDefault();
				elementAfterTrigger.focus();
			}
		}

		/**
		 * shiftTabbedFromElementAfterTrigger
		 * @param {KeyboardEvent} event
		 * @returns
		 */
		function shiftTabbedFromElementAfterTrigger(event) {
			if (!event.shiftKey) return;
			const elementAfterTrigger = getElementAfterTrigger();
			return event.target === elementAfterTrigger;
		}

		/**
		 * focusLastTabbableInPopover
		 * @param {KeyboardEvent} event
		 */
		function focusLastTabbableInPopover(event) {
			const elements = popoverRef.current && tabbable(popoverRef.current);
			const last = elements && elements[elements.length - 1];
			if (last) {
				event.preventDefault();
				last.focus();
			}
		}

		/**
		 * shiftTabbedOutOfPopover
		 * @param {KeyboardEvent} event
		 * @returns
		 */
		function shiftTabbedOutOfPopover(event) {
			const elements = popoverRef.current && tabbable(popoverRef.current);
			if (elements) {
				return elements.length === 0 ? false : event.target === elements[0];
			}
			return false;
		}

		/**
		 * focusTriggerRef
		 * @param {KeyboardEvent} event
		 */
		function focusTriggerRef(event) {
			event.preventDefault();
			triggerRef.current?.focus();
		}

		/**
		 *
		 * @param {KeyboardEvent} event
		 * @returns
		 */
		function tabbedToBrowserChrome(event) {
			const elements = popoverRef.current
				? tabbable(ownerDocument).filter(
						element => !popoverRef.current.contains(element),
				  )
				: null;
			return elements ? event.target === elements[elements.length - 1] : false;
		}

		/**
		 * shiftTabbedToBrowserChrome
		 * @param {KeyboardEvent} event
		 * @returns
		 */
		function shiftTabbedToBrowserChrome(event) {
			// we're assuming the popover will never contain the first tabbable
			// element, and it better not, because the trigger needs to be tabbable!
			return event.target === tabbable(ownerDocument)[0];
		}

		/** @type {Array<[HTMLElement, number]>} */
		let restoreTabIndexTuples = [];

		/**
		 * disableTabbablesInPopover
		 */
		function disableTabbablesInPopover() {
			const elements = popoverRef.current && tabbable(popoverRef.current);
			if (elements) {
				elements.forEach(element => {
					restoreTabIndexTuples.push([element, element.tabIndex]);
					element.tabIndex = -1;
				});
				ownerDocument.addEventListener('focusin', enableTabbablesInPopover);
			}
		}

		/**
		 * enableTabbablesInPopover
		 */
		function enableTabbablesInPopover() {
			ownerDocument.removeEventListener('focusin', enableTabbablesInPopover);
			restoreTabIndexTuples.forEach(([element, tabIndex]) => {
				element.tabIndex = tabIndex;
			});
		}

		/**
		 * getElementAfterTrigger
		 * @returns {boolean}
		 */
		function getElementAfterTrigger() {
			const elements = tabbable(ownerDocument);
			const targetIndex =
				elements && triggerRef.current
					? elements.indexOf(triggerRef.current)
					: -1;
			const elementAfterTrigger = elements && elements[targetIndex + 1];
			return popoverRef.current &&
				popoverRef.current.contains(elementAfterTrigger || null)
				? false
				: elementAfterTrigger;
		}

		ownerDocument.addEventListener('keydown', handleKeyDown);
		return () => {
			ownerDocument.removeEventListener('keydown', handleKeyDown);
		};
		// NOTE(joel): We can safely disable the exhaustive-deps rule, because
		// ownerDocument, triggerRef and popoverRef do not force a re-render
		// of React and thus shouldn't be included in the dependency array.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
}
