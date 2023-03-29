-- Adminer 4.8.1 PostgreSQL 15.2 (Debian 15.2-1.pgdg110+1) dump

DROP TABLE IF EXISTS "car";
CREATE TABLE "public"."car" (
    "id" character varying NOT NULL,
    "fullName" text NOT NULL,
    "title" text NOT NULL,
    "brand" character varying NOT NULL,
    "model" character varying NOT NULL,
    "year" integer NOT NULL,
    "mileage" integer NOT NULL,
    "condition" character varying NOT NULL,
    "fuel" character varying NOT NULL,
    "locationName" character varying(250) NOT NULL,
    "facilityName" character varying(250) NOT NULL,
    CONSTRAINT "car_id" PRIMARY KEY ("id")
) WITH (oids = false);


DROP TABLE IF EXISTS "price";
CREATE TABLE "public"."price" (
    "carId" character varying(100) NOT NULL,
    "price" integer NOT NULL,
    "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
) WITH (oids = false);

-- 2023-03-27 18:29:04.02296+00