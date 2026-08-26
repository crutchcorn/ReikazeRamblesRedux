import style from "./input.module.scss";
import { Fragment, JSX } from "preact";
import { useRandomId } from "utils/preact/useId";

type InputProps = JSX.IntrinsicElements["input"] & {
	label?: string;
	containerClass?: string;
};

export function Input({
	class: className = "",
	containerClass = "",
	...props
}: InputProps) {
	const _id = useRandomId();

	const id = props.id ?? _id;

	const Container = props.label ? "div" : Fragment;

	return (
		<Container class={`${style.labelContainer} ${containerClass}`}>
			{props.label && (
				<label
					class={`text-style-body-small-bold ${style.label}`}
					for={id}
					id={`${id}-label`}
				>
					{props.label}
				</label>
			)}
			<input
				{...props}
				id={id}
				class={`text-style-body-medium ${style.input} ${className}`}
			/>
		</Container>
	);
}
