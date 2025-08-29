import { pgTable, uuid, text, varchar, doublePrecision, integer, timestamp, jsonb, pgEnum, unique, index } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const privacyEnum = pgEnum('privacy', ['public', 'followers', 'private'])

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  displayName: text('display_name'),
  bio: text('bio'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const places = pgTable('places', {
  id: uuid('id').primaryKey().defaultRandom(),
  osmId: text('osm_id'),
  name: text('name').notNull(),
  lat: doublePrecision('lat').notNull(),
  lon: doublePrecision('lon').notNull(),
  country: text('country'),
  region: text('region'),
  city: text('city'),
  address: text('address'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  locationIdx: index('places_location_idx').on(table.lat, table.lon),
  osmIdIdx: index('places_osm_id_idx').on(table.osmId),
}))

export const visits = pgTable('visits', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  placeId: uuid('place_id').notNull().references(() => places.id, { onDelete: 'cascade' }),
  visitedOn: timestamp('visited_on', { withTimezone: true }).notNull(),
  rating: integer('rating'), // 0-5 rating
  note: text('note'),
  photos: jsonb('photos').$type<string[]>(), // Array of photo URLs
  privacy: privacyEnum('privacy').default('public').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userDateIdx: index('visits_user_date_idx').on(table.userId, table.createdAt),
  placeIdx: index('visits_place_idx').on(table.placeId),
  privacyIdx: index('visits_privacy_idx').on(table.privacy),
}))

export const follows = pgTable('follows', {
  followerId: uuid('follower_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  followeeId: uuid('followee_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  followUnique: unique().on(table.followerId, table.followeeId),
  followerIdx: index('follows_follower_idx').on(table.followerId),
  followeeIdx: index('follows_followee_idx').on(table.followeeId),
}))

export const likes = pgTable('likes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  visitId: uuid('visit_id').notNull().references(() => visits.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  likeUnique: unique().on(table.userId, table.visitId),
  userIdx: index('likes_user_idx').on(table.userId),
  visitIdx: index('likes_visit_idx').on(table.visitId),
}))

export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  visitId: uuid('visit_id').notNull().references(() => visits.id, { onDelete: 'cascade' }),
  body: text('body').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  visitDateIdx: index('comments_visit_date_idx').on(table.visitId, table.createdAt),
  userIdx: index('comments_user_idx').on(table.userId),
}))

// Relations
export const profilesRelations = relations(profiles, ({ many }) => ({
  visits: many(visits),
  followers: many(follows, { relationName: 'followers' }),
  following: many(follows, { relationName: 'following' }),
  likes: many(likes),
  comments: many(comments),
}))

export const placesRelations = relations(places, ({ many }) => ({
  visits: many(visits),
}))

export const visitsRelations = relations(visits, ({ one, many }) => ({
  user: one(profiles, {
    fields: [visits.userId],
    references: [profiles.id],
  }),
  place: one(places, {
    fields: [visits.placeId],
    references: [places.id],
  }),
  likes: many(likes),
  comments: many(comments),
}))

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(profiles, {
    fields: [follows.followerId],
    references: [profiles.id],
    relationName: 'followers',
  }),
  followee: one(profiles, {
    fields: [follows.followeeId],
    references: [profiles.id],
    relationName: 'following',
  }),
}))

export const likesRelations = relations(likes, ({ one }) => ({
  user: one(profiles, {
    fields: [likes.userId],
    references: [profiles.id],
  }),
  visit: one(visits, {
    fields: [likes.visitId],
    references: [visits.id],
  }),
}))

export const commentsRelations = relations(comments, ({ one }) => ({
  user: one(profiles, {
    fields: [comments.userId],
    references: [profiles.id],
  }),
  visit: one(visits, {
    fields: [comments.visitId],
    references: [visits.id],
  }),
}))