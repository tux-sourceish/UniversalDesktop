// src/core/UDFormat.ts

/**
 * UNIVERSALDESKTOP v2.1 - DAS GESETZBUCH
 * =======================================
 * 
 * Dies ist die ZENTRALE WAHRHEIT des Projekts, basierend auf Raimund Welschs
 * "Früher Himmel" Bagua-System und seiner erweiterten Algebra-Philosophie.
 * Alle Module MÜSSEN ihre Definitionen von hier importieren.
 * ES GIBT KEINE AUSNAHMEN.
 * 
 * @version 2.1.0-raimund-algebra
 */

export namespace UDFormat {
  
  // Raimunds Bagua-System (Früher Himmel)
  export const BAGUA = {
    HIMMEL: 0b000000001,  // µ1 - Classes/Templates (☰)
    WIND:   0b000000010,  // µ2 - Views/UI (☴)
    WASSER: 0b000000100,  // µ3 - Procedures/Flow (☵)
    BERG:   0b000001000,  // µ4 - Init/Setup (☶)
    SEE:    0b000010000,  // µ5 - Properties (☱)
    FEUER:  0b000100000,  // µ6 - Functions (☲)
    DONNER: 0b001000000,  // µ7 - Events (☳)
    ERDE:   0b010000000,  // µ8 - Global/Base (☷)
    TAIJI:  0b100000000   // ☯ - Center/Unity
  } as const;

  // Algebraischer Transistor - Raimunds Geniestreich
  export const transistor = (condition: boolean): number => {
    return Math.pow(0, condition ? 0 : 1);
  };

  // Item-Typen (Bagua-inspiriert)
  export const ItemType = {
    VORTEX: 0,        // ☯ Unknown/Origin
    KONSTRUKTOR: 1,   // ☰ Code/Templates
    TABELLE: 2,       // ☴ Tables/Views
    FLUSS: 3,         // ☵ Media/Streams
    INIT: 4,          // ☶ Configuration
    EIGENSCHAFT: 5,   // ☱ Properties
    FUNKTION: 6,      // ☲ Functions
    EREIGNIS: 7,      // ☳ Events/Triggers
    VARIABLE: 8,      // ☷ Data/Storage
    DATABASE: 9,      // Extended: Hyperdimensional
    SYSTEM: 10        // Extended: System-level
  } as const;
}