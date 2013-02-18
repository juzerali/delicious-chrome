all: crx zip

zip:
	zip -r extension.zip * -x *.zip *.crx

crx:
	zip -r extension.crx * -x *.zip *.crx

.PHONY: zip crx
