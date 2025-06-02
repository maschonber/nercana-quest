# Combat Simulator

The combat simulator is a subsystem of the Nercana Quest Station System Architecture, designed to provide a modular and interactive combat experience, and to test combat mechanics in a controlled environment.

It allows the player to manually select combatants of both sides:
For the hero team, the player can select a number of simulated clone heroes and select their level.
For the enemies, the player can select from all implemented monsters and their tiers. 

It is possible to select up to 3 combatants per side.

The fight itself uses the same combat mechanics as the main game, with the entry point being the combat service.

When starting a fight from the combat simulator, a fight can be simulated multiple times, and the results will be displayed in a table format, combined with a summary of win percentage per side. It is possible to jump to the fight details of each fight, which will show its detailed combat log in a sub view.