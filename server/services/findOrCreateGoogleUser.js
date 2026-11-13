export default async function findOrCreateGoogleUser(
  usersCollection,
  { uid, email },
) {
  const user = await usersCollection.findOne({
    firebaseUid: uid,
  })

  if (user) return user

  const normalizedEmail = email.trim().toLowerCase()

  const existingUser = await usersCollection.findOne({
    email: normalizedEmail,
  })

  if (existingUser) {
    throw Object.assign(
      new Error(
        "An account with this email already exists. Please use your existing sign-in method.",
      ),
      { status: 409 },
    )
  }

  try {
    await usersCollection.updateOne(
      { firebaseUid: uid },
      {
        $setOnInsert: {
          firebaseUid: uid,
          email: normalizedEmail,
          emailVerified: true,
          createdAt: new Date(),
        },
      },
      { upsert: true },
    )
  } catch (error) {
    if (error.code !== 11000) throw error

    // Another request may have created the same Firebase user.
    const concurrentUser = await usersCollection.findOne({
      firebaseUid: uid,
    })

    if (concurrentUser) return concurrentUser

    throw Object.assign(
      new Error("An account with this email already exists."),
      { status: 409 },
    )
  }

  const createdUser = await usersCollection.findOne({
    firebaseUid: uid,
  })

  if (!createdUser) {
    throw new Error("Google user was not found after creation")
  }

  return createdUser
}
