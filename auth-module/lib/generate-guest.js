export function generateGuestUser() {
  const rand = Math.random().toString(36).substring(2, 8);

  return {
    email: `guest_${rand}@temp.local`,
    password: `guest_${rand}`,
  };
}
