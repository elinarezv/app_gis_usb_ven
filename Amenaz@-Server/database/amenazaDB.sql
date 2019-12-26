CREATE TABLE users (
	ID SERIAL PRIMARY KEY,
	firstName VARCHAR(30),
	lastName VARCHAR(30),
	address VARCHAR(150),
	email VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(500),
	notifications BOOLEAN
);
CREATE TABLE users (
	ID SERIAL PRIMARY KEY,
	firstName VARCHAR(30),
	lastName VARCHAR(30),
	address VARCHAR(150),
	email VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(500),
	notifications BOOLEAN
);


CREATE OR REPLACE VIEW merida.polg_urbana_vertexes AS
WITH t AS -- Transfor polygons in sets of points
    (SELECT gid AS id_polygon,
            st_dumppoints(geom) AS dump
     FROM merida.Polg_urbana),
f AS -- Get the geometry and the indexes from the sets of points
    (SELECT t.id_polygon,
           (t.dump).path[1] AS part,
           (t.dump).path[3] AS vertex,
           (t.dump).geom AS geom
     FROM t)
-- Get all points filtering the last point for each geometry part
SELECT row_number() OVER () AS gid, -- Creating a unique id
       f.id_polygon,
       f.part,
       f.vertex,
       ST_X(f.geom) as x, -- Get point's X coordinate
       ST_Y(f.geom) as y, -- Get point's Y coordinate
       f.geom::geometry('POINT',2202) as geom -- make sure of the resulting geometry type
FROM f
WHERE (f.id_polygon, f.part, f.vertex) NOT IN
      (SELECT f.id_polygon,
              f.part,
              max(f.vertex) AS max
       FROM f
       GROUP BY f.id_polygon,
                f.part);


SELECT row_to_json(fc) FROM (
	SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (
		SELECT 'Feature' As type, ST_AsGeoJSON(lg.geom)::json As geometry,
		row_to_json((vertex)) As properties FROM coffee_shops As lg
	) As f
) As fc

SELECT 'Feature' As type,
	ST_AsGeoJSON(lg.geom, 15, 2)::json As geometry,
	row_to_json((lg.id, lg.descrip, lg.area)) As properties
FROM merida."Polg_urbana" As lg