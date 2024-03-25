## Example GET:

curl -X GET http://127.0.0.1:8000/docs/area/75504261:handbook/doc/objectives/

## Example PUT:

curl -X PUT -H "Content-Type: text/plain" --data-binary @docs/src/docs/handbook/objectives.md http://127.0.0.1:8000/docs/area/75504261:handbook/doc/objectives/

## Example DELETE:

curl -X DELETE http://127.0.0.1:8000/docs/area/75504261:handbook/doc/objectives/   