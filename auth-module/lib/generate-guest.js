export function generateGuestUser() {
  const rand = Math.random().toString(36).substring(2, 8);

  return {
    name: rand,
    email: `guest_${rand}@temp.local`,
    password: `guest_${rand}`,
    phone: '000000'
  };
}
