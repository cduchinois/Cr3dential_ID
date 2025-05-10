import { Box, Typography } from '@mui/material';

interface CredentialFieldsProps {
  type: string;
  fields: Record<string, any>;
}

function CredentialFields({ fields }: CredentialFieldsProps) {
  const formatFieldName = (name: string) => {
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
  };

  const formatFieldValue = (value: any): string => {
    if (value === null || value === undefined) {
      return '';
    }

    if (value instanceof Date) {
      return value.toLocaleDateString();
    }

    if (typeof value === 'object') {
      // If it's an object, stringify it with proper formatting
      return JSON.stringify(value, null, 2);
    }

    return value.toString();
  };

  const renderFields = (data: Record<string, any>, prefix = '') => {
    return Object.entries(data)
      .filter(([key]) => key !== 'id' && key !== 'type') // Exclude internal fields
      .map(([key, value]) => {
        const fieldName = prefix ? `${prefix}.${key}` : key;

        // If the value is an object and not null, recursively render its fields
        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
          return renderFields(value, fieldName);
        }

        return (
          <Box
            key={fieldName}
            sx={{
              mb: 2,
              '&:last-child': {
                mb: 0,
              },
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                mb: 0.5,
                fontWeight: 500,
              }}
            >
              {formatFieldName(key)}
            </Typography>
            <Typography
              sx={{
                color: '#fff',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                p: 1.5,
                borderRadius: 1,
                fontSize: '0.95rem',
                fontFamily: 'monospace',
                width: '100%',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {formatFieldValue(value)}
            </Typography>
          </Box>
        );
      });
  };

  return (
    <Box sx={{ width: '100%' }}>
      {renderFields(fields)}
    </Box>
  );
}

export default CredentialFields;