import { U } from "../../../dev/exampleHelpers";

export default function GridExample() {
  return (
    <U.Stack gap={4}>
      <U.Typography variant="title">Grid</U.Typography>

      <U.Grid columns={{ base: 1, sm: 2, lg: 4 }} gap={3}>
        {["Микрофон", "Минус", "Вокал", "Мелодия"].map((title) => (
          <U.Card key={title} title={title} description="Responsive ячейка" />
        ))}
      </U.Grid>

      <U.Grid columns={12} gap={3}>
        <U.Grid span={{ base: "full", md: 8 }}>
          <U.Card
            title="Основная область"
            description="8 из 12 колонок · растягивается правильно"
          />
        </U.Grid>
        <U.Grid span={{ base: "full", md: 4 }}>
          <U.Card
            title="Боковая область"
            description="4 из 12 колонок · растягивается правильно"
          />
        </U.Grid>
      </U.Grid>

      <U.Grid minChildWidth="11.25rem" gap={3}>
        <U.Card title="Auto-fit" description="Без расчёта числа колонок" />
        <U.Card title="Auto-fit" description="Подстраивается по ширине" />
        <U.Card title="Auto-fit" description="Минимальная ширина 11.25rem" />
      </U.Grid>
    </U.Stack>
  );
}
