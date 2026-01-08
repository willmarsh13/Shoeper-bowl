import nflreadpy as nfl

roster_df = nfl.load_rosters(seasons=[2025])

roster_df.write_csv("../server/data/players/playerInfo.csv")