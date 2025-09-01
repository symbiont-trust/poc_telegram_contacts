import type { FC } from 'react';
import { Box, Typography, Avatar, Chip } from '@mui/material';
import { Person } from '@mui/icons-material';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

interface HeaderProps {
  user: TelegramUser | null;
}

const Header: FC<HeaderProps> = ({ user }) => {
  if (!user) return null;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
      <Avatar src={user.photo_url}>
        <Person />
      </Avatar>
      <Box>
        <Typography variant="h6">
          Welcome, {user.first_name} {user.last_name}
        </Typography>
        {user.username && (
          <Chip label={`@${user.username}`} size="small" variant="outlined" />
        )}
      </Box>
    </Box>
  );
};

export default Header;