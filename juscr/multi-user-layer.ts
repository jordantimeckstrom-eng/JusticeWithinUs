// JUSCR Multi-User Shared Interface Layer

interface UserSession {
  id: string;
  name: string;
  state: any;
}

interface SharedEvent {
  type: string;
  payload: any;
  userId: string;
}

class JUSCRMultiUser {
  private users: Map<string, UserSession> = new Map();
  private listeners: ((event: SharedEvent) => void)[] = [];

  addUser(user: UserSession) {
    this.users.set(user.id, user);
    this.emit({ type: "USER_JOIN", payload: user, userId: user.id });
  }

  removeUser(userId: string) {
    this.users.delete(userId);
    this.emit({ type: "USER_LEAVE", payload: null, userId });
  }

  updateState(userId: string, newState: any) {
    const user = this.users.get(userId);
    if (!user) return;

    user.state = { ...user.state, ...newState };

    this.emit({
      type: "STATE_UPDATE",
      payload: user.state,
      userId
    });
  }

  onEvent(callback: (event: SharedEvent) => void) {
    this.listeners.push(callback);
  }

  private emit(event: SharedEvent) {
    this.listeners.forEach(cb => cb(event));
  }
}

export const multiUserSystem = new JUSCRMultiUser();
