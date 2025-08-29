DROP INDEX "places_location_idx";--> statement-breakpoint
CREATE INDEX "places_location_idx" ON "places" USING btree ("lat","lon");