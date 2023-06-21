# MapServer, Vector Tiles, and OpenLayers

To run:

Then change into the `mapserver-mvt` directory and start a development server (available at http://localhost:5173):

    cd D:\GitHub\mapserver-mvt
    npm start

To generate a build ready for production:

    cd D:\GitHub\mapserver-mvt
    npm run build

Then deploy the contents of the `dist` directory to your server.  You can also run `npm run serve` to serve the results of the `dist` directory for preview.


List expressions should be handled:

https://github.com/geostyler/geostyler-mapfile-parser/blob/17c74e1001802891c840c66729f0807a4dfbc412/data/mapfiles/point_st_sample_style_tags_single_filter_list.map#L12
EXPRESSION {bus,bank}


Specific version: npm install geostyler-cli@2.0.0 -g

npm install geostyler-cli -g

http://localhost/mapserver2/?map=D:/GitHub/mapserver-mvt/demo.map&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetStyles&LAYERS=countries

D:\MapServer\VS2022\mapserver\msautotest\misc\listexpression.map

cd /D D:\MapServer\VS2022\mapserver\msautotest\misc
SET MAPSERVER_CONFIG_FILE=C:\MapServer\apps\mapserver.conf
mapserv QUERY_STRING="map=listexpression.map&SERVICE=WMS&VERSION=1.3.0&REQUEST=GetStyles&LAYERS=charts"