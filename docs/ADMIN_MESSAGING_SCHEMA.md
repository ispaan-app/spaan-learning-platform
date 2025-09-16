// Firestore schema for admin-to-admin messages
// Collection: adminMessages
// Fields:
// - senderId: string (UID of the admin sending the message)
// - recipientId: string (UID of the admin receiving the message)
// - message: string (message content)
// - timestamp: Timestamp (when the message was sent)
// - read: boolean (whether the recipient has read the message)
//
// Example document:
// {
//   senderId: 'admin1',
//   recipientId: 'admin2',
//   message: 'Hello, can you review the new applicants?',
//   timestamp: <Firestore Timestamp>,
//   read: false
// }
//
// Indexes: Consider composite index on [recipientId, timestamp desc] for efficient inbox queries.
