import { SHOP_ODDS } from "../data/odds";

export function OddsTable() {
  return (
    <section className="odds">
      <h3>Shop odds</h3>
      <p className="muted">Fixed table for reference. Not tied to the live match.</p>
      <table>
        <thead>
          <tr>
            <th>Lvl</th>
            <th>1</th>
            <th>2</th>
            <th>3</th>
            <th>4</th>
            <th>5</th>
          </tr>
        </thead>
        <tbody>
          {SHOP_ODDS.map((row) => (
            <tr key={row.level}>
              <td>{row.level}</td>
              {row.odds.map((value, index) => (
                <td key={index} className={value ? "" : "dim"}>
                  {value}%
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
