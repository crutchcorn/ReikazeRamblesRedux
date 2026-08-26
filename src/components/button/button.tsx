import { JSXNode, PropsWithChildren } from "../types";
import { JSX, Ref } from "preact";
import { forwardRef } from "preact/compat";
import { withBasePath } from "utils/base-path";

export type ButtonTag = "a" | "button" | "span" | "div";

type AllowedElements<Tag extends ButtonTag> = Tag extends "a"
	? HTMLAnchorElement
	: Tag extends "div"
		? HTMLDivElement
		: Tag extends "span"
			? HTMLSpanElement
			: HTMLButtonElement;

type ButtonOwnProps = {
	class?: string;
	leftIcon?: JSXNode;
	rightIcon?: JSXNode;
	// For when the user is _actually_ focused on another element, like react-aria radio buttons
	isFocusVisible?: boolean;
	variant?:
		"primary-emphasized" | "secondary-emphasized" | "primary" | "secondary";
};

type ButtonPropsFor<Tag extends ButtonTag> = PropsWithChildren<
	ButtonOwnProps &
		(Tag extends "a" ? { tag?: Tag } : { tag: Tag }) &
		JSX.IntrinsicElements[Tag]
>;

type ButtonProps = {
	[Tag in ButtonTag]: ButtonPropsFor<Tag>;
}[ButtonTag];

type RefProps<Tag extends ButtonTag> = { ref?: Ref<AllowedElements<Tag>> };

type ButtonComponent = {
	(props: ButtonPropsFor<"button"> & RefProps<"button">): JSX.Element;
	(props: ButtonPropsFor<"div"> & RefProps<"div">): JSX.Element;
	(props: ButtonPropsFor<"span"> & RefProps<"span">): JSX.Element;
	(props: ButtonPropsFor<"a"> & RefProps<"a">): JSX.Element;
};

const ButtonWrapperBase = forwardRef<
	AllowedElements<ButtonTag> | null,
	ButtonProps
>(
	(
		{
			tag = "a" as never,
			class: className,
			children,
			variant = "primary",
			leftIcon,
			rightIcon,
			isFocusVisible,
			...props
		},
		ref,
	) => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const Wrapper: any = tag;
		const href = (props as { href?: unknown }).href;
		const wrapperProps =
			tag === "a" && typeof href === "string"
				? { ...props, href: withBasePath(href) }
				: props;

		return (
			<Wrapper
				{...wrapperProps}
				aria-label={wrapperProps["aria-label"]}
				data-focus-visible={isFocusVisible}
				class={["button", className, variant].filter((c) => !!c).join(" ")}
				ref={ref}
			>
				{leftIcon && (
					<div aria-hidden="true" class="buttonIcon">
						{leftIcon}
					</div>
				)}
				<span className="innerText">{children}</span>
				{rightIcon && (
					<div aria-hidden="true" class="buttonIcon">
						{rightIcon}
					</div>
				)}
			</Wrapper>
		);
	},
);

export const Button = forwardRef<
	AllowedElements<ButtonTag> | null,
	ButtonProps
>(({ class: className = "", ...props }, ref) => {
	return (
		<ButtonWrapperBase
			{...props}
			class={`text-style-button-regular regular ${className}`}
			ref={ref}
		/>
	);
}) as unknown as ButtonComponent;

export const LargeButton = forwardRef<
	AllowedElements<ButtonTag> | null,
	ButtonProps
>(({ class: className = "", ...props }, ref) => {
	return (
		<ButtonWrapperBase
			{...props}
			class={`text-style-button-large large ${className}`}
			ref={ref}
		/>
	);
}) as unknown as ButtonComponent;

export type IconOnlyButtonPropsFor<Tag extends ButtonTag> = Omit<
	ButtonPropsFor<Tag>,
	"leftIcon" | "rightIcon"
>;

type IconOnlyButtonProps = {
	[Tag in ButtonTag]: IconOnlyButtonPropsFor<Tag>;
}[ButtonTag];

type IconOnlyButtonComponent = {
	(props: IconOnlyButtonPropsFor<"button"> & RefProps<"button">): JSX.Element;
	(props: IconOnlyButtonPropsFor<"div"> & RefProps<"div">): JSX.Element;
	(props: IconOnlyButtonPropsFor<"span"> & RefProps<"span">): JSX.Element;
	(props: IconOnlyButtonPropsFor<"a"> & RefProps<"a">): JSX.Element;
};

export const IconOnlyButton = forwardRef<
	AllowedElements<ButtonTag> | null,
	IconOnlyButtonProps
>(({ class: className = "", children, ...props }, ref) => {
	return (
		<ButtonWrapperBase
			{...props}
			class={`iconOnly regular ${className}`}
			ref={ref}
		>
			<div class="iconOnlyButtonIcon" aria-hidden="true">
				{children}
			</div>
		</ButtonWrapperBase>
	);
}) as unknown as IconOnlyButtonComponent;

const LargeIconOnlyButton = forwardRef<
	AllowedElements<ButtonTag> | null,
	IconOnlyButtonProps
>(({ class: className = "", children, ...props }, ref) => {
	return (
		<ButtonWrapperBase
			{...props}
			class={`iconOnly large ${className}`}
			ref={ref}
		>
			<div class="iconOnlyButtonIcon" aria-hidden="true">
				{children}
			</div>
		</ButtonWrapperBase>
	);
}) as unknown as IconOnlyButtonComponent;
