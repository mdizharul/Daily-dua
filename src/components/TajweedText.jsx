import { segmentArabic, tajweedRule, TAJWEED_RULES } from "../utils/tajweed";

/** Arabic text with key tajweed letters underlined in their rule colour. */
export default function TajweedText({ text, defaultColor }) {
  return (
    <span>
      {segmentArabic(text).map((segment, i) => {
        const rule = tajweedRule(segment);
        const underline = rule && {
          textDecoration: "underline",
          textDecorationColor: TAJWEED_RULES[rule].color,
          textDecorationThickness: "2px",
          textUnderlineOffset: "4px",
        };
        return (
          <span key={i} style={{ color: defaultColor, ...underline }}>
            {segment.seg}
          </span>
        );
      })}
    </span>
  );
}
