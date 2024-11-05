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
import { useEffect, useState } from 'react';

import { StoredCredential } from '@/types/credential';

function CredentialCard({ credential }: { credential: StoredCredential }) {
  // Get display name based on credential type
  const getCredentialName = (credential: StoredCredential) => {
    return credential.credentialSubject?.name || credential.type;
  };

  // Get issuer display name
  const getIssuerName = (issuerDid: string, maxCharacters: number = 0) => {
    const [issuerName, setIssuerName] = useState(issuerDid);

    useEffect(() => {
      fetch('/api/issuers')
        .then(res => res.json())
        .then((data: any) => {
          const issuer = data.issuers.find((i: any) => i.did === issuerDid);
          if (issuer) {
            setIssuerName(issuer.name);
          }
        })
        .catch(err => {
          console.error('Error fetching issuer data:', err);
        });
    }, [issuerDid]);

    return maxCharacters > 0 && issuerName.length > maxCharacters ? issuerName.substring(0, maxCharacters) + '...' : issuerName;
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
            backgroundColor: '#ededed',
            width: '100px',
            height: '100px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Image
            src={credential.image || '/images/default-credential.png'}
            alt={getCredentialName(credential)}
            width={100}
            height={100}
            style={{
              objectFit: 'contain', // Changed from 'cover' to 'contain' to preserve aspect ratio
              maxWidth: '100%',
              maxHeight: '100%',
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
            {getCredentialName(credential)}
          </Typography>
          <Typography
            color='text.secondary'
            variant='body2'
            sx={{
              fontSize: '0.875rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '100%'
            }}
          >
            {getIssuerName(credential.issuer, 24)}
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
