const parseSync = require("./utils/parseSync");

// this is a list of all @types/react imports
const typesToRemove = new Set([
	"ReactText",
	"ReactNode",
	"ReactElement",
	"ReactFragment",
	"ReactPortal",
	"ReactNodeArray",
	"ReactChild",
	"ReactChildren",
	"ReactComponentElement",
	"Dispatch",
	"SyntheticEvent",
	"MouseEvent",
	"MouseEventHandler",
	"KeyboardEvent",
	"KeyboardEventHandler",
	"FocusEvent",
	"FocusEventHandler",
	"ChangeEvent",
	"ChangeEventHandler",
	"DragEvent",
	"DragEventHandler",
	"TouchEvent",
	"TouchEventHandler",
	"AnimationEvent",
	"AnimationEventHandler",
	"PropsWithRef",
	"PropsWithoutRef",
	"PropsWithChildren",
	"ElementType",
	"ComponentType",
	"Ref",
	"RefCallback",
	"LegacyRef",
	"ComponentProps",
	"ComponentPropsWithRef",
	"ComponentPropsWithoutRef",
	"Attributes",
	"ClassAttributes",
	"RefAttributes",
	"HTMLProps",
	"DetailedHTMLProps",
	"HTMLAttributes",
	"AnchorHTMLAttributes",
	"AreaHTMLAttributes",
	"AudioHTMLAttributes",
	"BaseHTMLAttributes",
	"BlockquoteHTMLAttributes",
	"ButtonHTMLAttributes",
	"CanvasHTMLAttributes",
	"ColHTMLAttributes",
	"ColgroupHTMLAttributes",
	"DataHTMLAttributes",
	"DetailsHTMLAttributes",
	"DialogHTMLAttributes",
	"EmbedHTMLAttributes",
	"FieldsetHTMLAttributes",
	"FormHTMLAttributes",
	"HtmlHTMLAttributes",
	"IframeHTMLAttributes",
	"ImgHTMLAttributes",
	"InputHTMLAttributes",
	"InsHTMLAttributes",
	"KeygenHTMLAttributes",
	"LabelHTMLAttributes",
	"LegendHTMLAttributes",
	"LiHTMLAttributes",
	"LinkHTMLAttributes",
	"MainHTMLAttributes",
	"MapHTMLAttributes",
	"MenuHTMLAttributes",
	"MenuitemHTMLAttributes",
	"MetaHTMLAttributes",
	"MeterHTMLAttributes",
	"ObjectHTMLAttributes",
	"OlHTMLAttributes",
	"OptgroupHTMLAttributes",
	"OptionHTMLAttributes",
	"OutputHTMLAttributes",
	"ParamHTMLAttributes",
	"ProgressHTMLAttributes",
	"QuoteHTMLAttributes",
	"ScriptHTMLAttributes",
	"SelectHTMLAttributes",
	"SourceHTMLAttributes",
	"StyleHTMLAttributes",
	"TableHTMLAttributes",
	"TdHTMLAttributes",
	"TextareaHTMLAttributes",
	"TfootHTMLAttributes",
	"ThHTMLAttributes",
	"TheadHTMLAttributes",
	"TimeHTMLAttributes",
	"TitleHTMLAttributes",
	"TrackHTMLAttributes",
	"UHTMLAttributes",
	"UlHTMLAttributes",
	"VarHTMLAttributes",
	"VideoHTMLAttributes",
	"SVGProps",
	"SVGAttributes",
	"SVGElement",
]);

/**
 * @param {import('jscodeshift').TSTypeReference['typeName']} typeName
 * @returns {import('jscodeshift').Identifier | null}
 */
function getIdentifierFromTypeName(typeName) {
	let identifier = null;

	if (typeName.type === "Identifier") {
		identifier = typeName;
	}

	if (
		typeName.type === "TSQualifiedName" &&
		typeName.right.type === "Identifier"
	) {
		identifier = typeName.right;
	}

	return identifier;
}

/**
 * @type {import('jscodeshift').Transform}
 */
const deprecatedReactTextTransform = (file, api) => {
	const j = api.jscodeshift;
	const ast = parseSync(file);

	const replacedIdentifiers = new Set();

	const changedIdentifiers = ast
		.find(j.TSTypeReference, (node) => {
			const { typeName } = node;

			const identifier = getIdentifierFromTypeName(typeName);

			// this is a list of all @types/react imports used

			return identifier !== null && typesToRemove.has(identifier.name);
		})
		.replaceWith((path) => {
			const identifier = getIdentifierFromTypeName(path.value.typeName);

			if (!identifier) {
				return path.value;
			}

			replacedIdentifiers.add(identifier.name);

			return j.tsTypeReference(
				j.tsQualifiedName(j.identifier("React"), j.identifier(identifier.name))
			);
		});

	// now remove those imports from "react"
	if (replacedIdentifiers.size > 0) {
		ast
			.find(j.ImportDeclaration)
			.filter((path) => path.node.source.value === "react")
			.find(j.ImportSpecifier)
			.filter((path) => replacedIdentifiers.has(path.node.imported.name))
			.remove();

		ast
			.find(j.ImportDeclaration)
			.filter((path) => path.node.source.value === "react")
			.filter((path) =>
				path.node.specifiers ? path.node.specifiers.length === 0 : false
			)
			.remove();
	}

	if (changedIdentifiers.length > 0) {
		return ast.toSource();
	}

	return file.source;
};

module.exports = deprecatedReactTextTransform;
