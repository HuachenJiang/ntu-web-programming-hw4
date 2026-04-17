import { Stack, Typography } from '@mui/material';

interface SectionIntroProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function SectionIntro({ eyebrow, title, description }: SectionIntroProps) {
  return (
    <Stack spacing={1.2}>
      <Typography variant="overline" color="secondary.main" fontWeight={700}>
        {eyebrow}
      </Typography>
      <Typography variant="h3">{title}</Typography>
      <Typography color="text.secondary" maxWidth={720}>
        {description}
      </Typography>
    </Stack>
  );
}
