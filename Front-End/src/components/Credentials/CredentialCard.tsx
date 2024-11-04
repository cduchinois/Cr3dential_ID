import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
import {
  Card,
  CardActions,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';

import { StoredCredential } from '@/types/credential';

function CredentialCard({ credential }: { credential: StoredCredential }) {
  // Get display name based on credential type
  const getCredentialName = (credential: StoredCredential) => {
    const type = credential.type[credential.type.length - 1];
    return type
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get issuer display name
  const getIssuerName = (issuerDid: string) => {
    const issuerMap: Record<string, string> = {
      'did:xrp:1:1234567890': 'XRPL Commons',
      // Add other issuer mappings as needed
    };
    return issuerMap[issuerDid] || issuerDid;
  };

  return (
    <Link href={`/credential-app/credentials/${credential.id}`} passHref>
      <Card
        sx={{
          display: 'flex',
          p: 2,
          gap: 2,
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            backgroundColor: '#fff',
            width: '100px',
            height: '100px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
          }}
        >
          <Image
            src={credential.image || '/images/default-credential.png'}
            alt={getCredentialName(credential)}
            width={100}
            height={100}
            style={{
              objectFit: 'contain',
              borderRadius: '8px',
            }}
          />
        </div>
        <Stack
          sx={{
            flexGrow: 1,
          }}
        >
          <Typography>
            {credential.typeLabel || getCredentialName(credential)}
          </Typography>
          <Typography color='text.secondary'>
            {getIssuerName(credential.issuer)}
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            Issued: {new Date(credential.issuanceDate).toLocaleDateString()}
          </Typography>
          <CardActions
            sx={{
              display: 'flex',
              gap: 0,
              flexDirection: 'row',
              justifyContent: 'flex-end',
            }}
          >
            <IconButton>
              <DeleteIcon />
            </IconButton>
            <IconButton>
              <ShareIcon />
            </IconButton>
          </CardActions>
        </Stack>
      </Card>
    </Link>
  );
}

export default CredentialCard;
