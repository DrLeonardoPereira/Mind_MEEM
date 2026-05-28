import { PlayerData, Gender, EducationLevel, PhaseTelemetry } from '../contexts/GameContext';

// ============================================================================
// Types and Interfaces
// ============================================================================

/**
 * Options for CSV export configuration
 */
export interface CSVExportOptions {
  /**
   * Include UTF-8 BOM for Excel compatibility
   * @default true
   */
  includeBOM?: boolean;

  /**
   * Date format for export timestamp
   * @default 'ISO' // ISO 8601 format
   */
  dateFormat?: 'ISO' | 'BR' | 'US';

  /**
   * Delimiter for CSV fields
   * @default ','
   */
  delimiter?: ',' | ';';

  /**
   * Include timestamp in filename
   * @default true
   */
  includeTimestamp?: boolean;

  /**
   * Decimal separator for numeric values
   * @default '.'
   */
  decimalSeparator?: '.' | ',';
}

/**
 * CSV row data structure
 */
interface CSVRow {
  nome: string;
  sexo: string;
  dataNascimento: string;
  escolaridade: string;
  fase: string;
  pontuacao: string;
  tempoReacao: string;
  taxaHesitacao: string;
  timestamp: string;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Gender display mapping
 */
const GENDER_DISPLAY_MAP: Record<Gender, string> = {
  [Gender.MALE]: 'Masculino',
  [Gender.FEMALE]: 'Feminino',
  [Gender.OTHER]: 'Outro',
  [Gender.PREFER_NOT_TO_SAY]: 'Prefiro não informar',
};

/**
 * Education level display mapping
 */
const EDUCATION_DISPLAY_MAP: Record<EducationLevel, string> = {
  [EducationLevel.ELEMENTARY]: 'Ensino Fundamental',
  [EducationLevel.MIDDLE_SCHOOL]: 'Ensino Médio (Incompleto)',
  [EducationLevel.HIGH_SCHOOL]: 'Ensino Médio',
  [EducationLevel.BACHELORS]: "Ensino Superior (Bacharelado)",
  [EducationLevel.MASTERS]: 'Mestrado',
  [EducationLevel.PHD]: 'Doutorado',
  [EducationLevel.OTHER]: 'Outro',
};

/**
 * CSV Headers in Portuguese
 */
const CSV_HEADERS = [
  'Nome',
  'Sexo',
  'Data de Nascimento',
  'Escolaridade',
  'Fase',
  'Pontuação (0-10)',
  'Tempo de Reação (s)',
  'Taxa de Hesitação (%)',
  'Data/Hora',
];

/**
 * UTF-8 BOM (Byte Order Mark) for Excel compatibility
 * This ensures that special characters (like ç, ã, etc.) are properly
 * recognized when the file is opened in Microsoft Excel
 */
const UTF8_BOM = '\uFEFF';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Escape special characters in CSV fields
 * Fields containing commas, quotes, or newlines must be quoted
 *
 * @param field - The field value to escape
 * @param delimiter - The CSV delimiter being used
 * @returns Escaped field value
 */
function escapeCSVField(field: string, delimiter: string = ','): string {
  if (
    field.includes(delimiter) ||
    field.includes('"') ||
    field.includes('\n') ||
    field.includes('\r')
  ) {
    // Escape quotes by doubling them
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

/**
 * Format date based on locale preference
 *
 * @param dateString - ISO 8601 date string or date value
 * @param format - Date format preference
 * @returns Formatted date string
 */
function formatDate(
  dateString: string,
  format: 'ISO' | 'BR' | 'US',
): string {
  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return dateString; // Return original if invalid
    }

    switch (format) {
      case 'BR': {
        // DD/MM/YYYY format
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      }

      case 'US': {
        // MM/DD/YYYY format
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
      }

      case 'ISO':
      default: {
        // YYYY-MM-DD format
        return date.toISOString().split('T')[0];
      }
    }
  } catch (error) {
    return dateString;
  }
}

/**
 * Format numeric value with specified decimal separator
 *
 * @param value - Numeric value to format
 * @param decimalPlaces - Number of decimal places
 * @param decimalSeparator - Separator to use (. or ,)
 * @returns Formatted string
 */
function formatNumber(
  value: number,
  decimalPlaces: number = 2,
  decimalSeparator: '.' | ',' = '.',
): string {
  const formatted = value.toFixed(decimalPlaces);

  if (decimalSeparator === ',') {
    return formatted.replace('.', ',');
  }

  return formatted;
}

/**
 * Get current timestamp formatted
 *
 * @param format - Date format preference
 * @returns Formatted timestamp
 */
function getCurrentTimestamp(format: 'ISO' | 'BR' | 'US'): string {
  const now = new Date();
  const date = formatDate(now.toISOString(), format);
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  return `${date} ${time}`;
}

/**
 * Convert gender enum to display string
 */
function getGenderDisplay(gender: Gender): string {
  return GENDER_DISPLAY_MAP[gender] || gender;
}

/**
 * Convert education level enum to display string
 */
function getEducationDisplay(education: EducationLevel): string {
  return EDUCATION_DISPLAY_MAP[education] || education;
}

// ============================================================================
// Main Export Function
// ============================================================================

/**
 * Generate and export player data and game telemetry as CSV file
 *
 * This function creates a properly formatted CSV file with:
 * - UTF-8 BOM for Microsoft Excel compatibility with special characters
 * - Player registration data (name, gender, birth date, education)
 * - Phase-by-phase telemetry results (score, reaction time, hesitation rate)
 * - Proper field escaping for special characters and delimiters
 * - Flexible formatting options for different locales
 *
 * Features:
 * - Automatic file download in browser
 * - Portuguese headers and labels for Brazilian users
 * - Support for multiple date formats (ISO, BR, US)
 * - Support for different CSV delimiters (comma, semicolon)
 * - Customizable decimal separators
 * - Proper UTF-8 encoding with BOM
 * - Error handling and logging
 *
 * @param playerData - Player registration information
 * @param telemetryData - Array of phase telemetry results
 * @param options - Export configuration options
 *
 * @example
 * ```typescript
 * const playerData: PlayerData = {
 *   name: 'João Silva',
 *   gender: Gender.MALE,
 *   dateOfBirth: '1990-05-15',
 *   educationLevel: EducationLevel.BACHELORS,
 * };
 *
 * const telemetry: PhaseTelemetry[] = [
 *   {
 *     phaseId: 'phase-1',
 *     score: 8.5,
 *     reactionTime: 1200,
 *     hesitationRate: 5.2,
 *     timestamp: new Date().toISOString(),
 *     duration: 1200,
 *   },
 * ];
 *
 * exportToCSV(playerData, telemetry, {
 *   includeBOM: true,
 *   dateFormat: 'BR',
 *   delimiter: ';',
 *   decimalSeparator: ',',
 * });
 * ```
 *
 * @throws Error if data validation fails
 */
export function exportToCSV(
  playerData: PlayerData,
  telemetryData: PhaseTelemetry[],
  options: CSVExportOptions = {},
): void {
  try {
    // ====================================================================
    // Configuration
    // ====================================================================

    const {
      includeBOM = true,
      dateFormat = 'ISO',
      delimiter = ',',
      includeTimestamp = true,
      decimalSeparator = '.',
    } = options;

    // ====================================================================
    // Validation
    // ====================================================================

    if (!playerData) {
      throw new Error('Dados do jogador não fornecidos');
    }

    if (!playerData.name || !playerData.name.trim()) {
      throw new Error('Nome do jogador é obrigatório');
    }

    if (!Array.isArray(telemetryData) || telemetryData.length === 0) {
      console.warn(
        'Aviso: Nenhum dado de telemetria fornecido. Criando CSV apenas com dados do jogador.',
      );
    }

    // ====================================================================
    // Build CSV Content
    // ====================================================================

    const rows: string[] = [];

    // Add BOM if requested (must be first)
    let csvContent = includeBOM ? UTF8_BOM : '';

    // Add header row
    rows.push(CSV_HEADERS.map((header) => escapeCSVField(header, delimiter)).join(delimiter));

    // Process each telemetry entry
    if (telemetryData.length > 0) {
      telemetryData.forEach((telemetry) => {
        const row: CSVRow = {
          nome: playerData.name,
          sexo: getGenderDisplay(playerData.gender),
          dataNascimento: formatDate(playerData.dateOfBirth, dateFormat),
          escolaridade: getEducationDisplay(playerData.educationLevel),
          fase: telemetry.phaseId,
          pontuacao: formatNumber(telemetry.score, 2, decimalSeparator),
          tempoReacao: formatNumber(
            telemetry.reactionTime / 1000, // Convert milliseconds to seconds
            2,
            decimalSeparator,
          ),
          taxaHesitacao: formatNumber(
            telemetry.hesitationRate,
            1,
            decimalSeparator,
          ),
          timestamp: formatDate(telemetry.timestamp, dateFormat),
        };

        const csvRow = Object.values(row)
          .map((value) => escapeCSVField(value, delimiter))
          .join(delimiter);

        rows.push(csvRow);
      });
    } else {
      // Add a single row with player data if no telemetry
      const emptyRow: CSVRow = {
        nome: playerData.name,
        sexo: getGenderDisplay(playerData.gender),
        dataNascimento: formatDate(playerData.dateOfBirth, dateFormat),
        escolaridade: getEducationDisplay(playerData.educationLevel),
        fase: 'N/A',
        pontuacao: 'N/A',
        tempoReacao: 'N/A',
        taxaHesitacao: 'N/A',
        timestamp: getCurrentTimestamp(dateFormat),
      };

      const csvRow = Object.values(emptyRow)
        .map((value) => escapeCSVField(value, delimiter))
        .join(delimiter);

      rows.push(csvRow);
    }

    csvContent += rows.join('\n');

    // ====================================================================
    // Create Blob and Download
    // ====================================================================

    // Create Blob with UTF-8 encoding
    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    });

    // Generate filename
    const playerNameSanitized = playerData.name
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');

    const timestamp = includeTimestamp
      ? `_${new Date().toISOString().split('T')[0]}_${new Date().getTime()}`
      : '';

    const filename = `MEEM_${playerNameSanitized}${timestamp}.csv`;

    // Create download link
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up URL object
    URL.revokeObjectURL(url);

    // Log success
    console.log(`✅ Arquivo CSV exportado com sucesso: ${filename}`, {
      jogador: playerData.name,
      fases: telemetryData.length,
      tamanhoBlob: `${(blob.size / 1024).toFixed(2)} KB`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Erro ao exportar CSV:', error);
    throw new Error(
      `Falha na exportação CSV: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    );
  }
}

/**
 * Alternative export function that returns CSV string instead of downloading
 *
 * Useful for testing, logging, or sending data to a server
 *
 * @param playerData - Player registration information
 * @param telemetryData - Array of phase telemetry results
 * @param options - Export configuration options
 * @returns CSV content as string
 */
export function generateCSVString(
  playerData: PlayerData,
  telemetryData: PhaseTelemetry[],
  options: CSVExportOptions = {},
): string {
  try {
    const {
      includeBOM = true,
      dateFormat = 'ISO',
      delimiter = ',',
      decimalSeparator = '.',
    } = options;

    const rows: string[] = [];

    // Add BOM if requested
    let csvContent = includeBOM ? UTF8_BOM : '';

    // Add header row
    rows.push(CSV_HEADERS.map((header) => escapeCSVField(header, delimiter)).join(delimiter));

    // Process telemetry data
    if (telemetryData.length > 0) {
      telemetryData.forEach((telemetry) => {
        const row: CSVRow = {
          nome: playerData.name,
          sexo: getGenderDisplay(playerData.gender),
          dataNascimento: formatDate(playerData.dateOfBirth, dateFormat),
          escolaridade: getEducationDisplay(playerData.educationLevel),
          fase: telemetry.phaseId,
          pontuacao: formatNumber(telemetry.score, 2, decimalSeparator),
          tempoReacao: formatNumber(
            telemetry.reactionTime / 1000,
            2,
            decimalSeparator,
          ),
          taxaHesitacao: formatNumber(
            telemetry.hesitationRate,
            1,
            decimalSeparator,
          ),
          timestamp: formatDate(telemetry.timestamp, dateFormat),
        };

        const csvRow = Object.values(row)
          .map((value) => escapeCSVField(value, delimiter))
          .join(delimiter);

        rows.push(csvRow);
      });
    }

    csvContent += rows.join('\n');
    return csvContent;
  } catch (error) {
    console.error('❌ Erro ao gerar string CSV:', error);
    throw new Error(
      `Falha na geração de CSV: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    );
  }
}

export default exportToCSV;
