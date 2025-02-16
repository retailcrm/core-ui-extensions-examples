TARGET_HEADER=@echo -e '===== \e[34m' $@ '\e[0m'
YARN=docker-compose run --rm node yarn

.PHONY: node_modules
node_modules: package.json yarn.lock ## Installs dependencies
	$(TARGET_HEADER)
	@docker-compose run --rm node yarn install --silent
	@touch node_modules || true

.PHONY: build
build: ## Builds the package
	$(TARGET_HEADER)
	$(YARN) build

.PHONY: build-dev
build-dev: ## Builds the package
	$(TARGET_HEADER)
	$(YARN) build:dev

start:
	$(TARGET_HEADER)
	@docker-compose up -d

stop:
	$(TARGET_HEADER)
	@docker-compose stop

.PHONY: restart
restart: ## Restarts all docker services or a particular service, if argument "service" is specified (example: make restart service="server").
	$(TARGET_HEADER)

ifdef service
	yes | docker-compose rm -s -v $(service) && docker-compose up -d $(service)
else
	docker-compose stop && docker-compose up -d
endif

.PHONY: help
help: ## Calls recipes list
	@cat $(MAKEFILE_LIST) | grep -e "^[a-zA-Z_\-]*: *.*## *" | awk '\
	    BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

# Colors
$(call computable,CC_BLACK,$(shell tput -Txterm setaf 0 2>/dev/null))
$(call computable,CC_RED,$(shell tput -Txterm setaf 1 2>/dev/null))
$(call computable,CC_GREEN,$(shell tput -Txterm setaf 2 2>/dev/null))
$(call computable,CC_YELLOW,$(shell tput -Txterm setaf 3 2>/dev/null))
$(call computable,CC_BLUE,$(shell tput -Txterm setaf 4 2>/dev/null))
$(call computable,CC_MAGENTA,$(shell tput -Txterm setaf 5 2>/dev/null))
$(call computable,CC_CYAN,$(shell tput -Txterm setaf 6 2>/dev/null))
$(call computable,CC_WHITE,$(shell tput -Txterm setaf 7 2>/dev/null))
$(call computable,CC_END,$(shell tput -Txterm sgr0 2>/dev/null))

## Creates zip archive with manifest.json
.PHONY: zip-archive
zip-archive:
	@read -p "Укажите папку модуля из папки dist/, который вы хотите собрать: " PACKAGE_NAME; \
	read -p "Введите новую версию для $$PACKAGE_NAME (version): " VERSION; \
	read -p "Введите области видимости (targets) для $$PACKAGE_NAME через запятую: " TARGETS_INPUT; \
	DIR=dist/$$PACKAGE_NAME; \
	TARGET_ARRAY=$$(echo $$TARGETS_INPUT | tr ',' '\n' | awk '{print "\""$$1"\""}' | paste -sd, -); \
	CSS_FILE=$$(ls $$DIR/*.css 2>/dev/null | head -n 1); \
	JS_FILE=$$(ls $$DIR/*.js | head -n 1); \
	HTML_FILE=$$(ls $$DIR/*.html | head -n 1); \
	JSON_CONTENT=$$( \
		echo '{"code":"'"$$PACKAGE_NAME"'","version":"'"$$VERSION"'","targets":['"$$TARGET_ARRAY"'],"entrypoint":"'"$${HTML_FILE##*/}"'","scripts":["'"$${JS_FILE##*/}"'"]' ; \
		if [ -n "$$CSS_FILE" ]; then \
			echo ',"stylesheet":"'"$${CSS_FILE##*/}"'"' ; \
		fi ; \
		echo '}' \
	); \
	echo $$JSON_CONTENT > $$DIR/manifest.json; \
	zip -rjFS $$DIR.zip $$DIR/*; \
	rm $$DIR/manifest.json; \

# Register module in CRM
.PHONY: register
register:
	@read -p "Введите URL CRM (CRM_URL): " CRM_URL; \
	read -p "Введите API ключ (API_KEY): " API_KEY; \
	read -p "Введите название модуля (MODULE_NAME): " MODULE_NAME; \
	read -p "Введите базовый адрес модуля (MODULE_URL): " MODULE_URL; \
	MODULE_DATA=$$(jq -r '.items[] | select(.name=="'"$$MODULE_NAME"'")' ./cases.json); \
	if [ -z "$$MODULE_DATA" ]; then \
		echo "Модуль $$MODULE_NAME не найден в cases.json"; \
		exit 1; \
	fi; \
	MODULE_UUID=$$(echo $$MODULE_DATA | jq -r '.uuid'); \
	MODULE_TARGETS=$$(echo $$MODULE_DATA | jq -r '.targets | map("\"" + . + "\"") | join(",")'); \
	MODULE_ENTRYPOINT=$$(echo $$MODULE_DATA | jq -r '.entrypoint'); \
	MODULE_STYLESHEET=$$(echo $$MODULE_DATA | jq -r '.stylesheet // empty'); \
	CURL_DATA=$$( \
		echo '{"code":"'"$$MODULE_NAME"'",' \
		     '"integrationCode":"'"$$MODULE_NAME"'",' \
		     '"active":true,' \
		     '"name":"'"$$MODULE_NAME"'",' \
		     '"clientId":"client-id-xxx",' \
		     '"baseUrl":"'"$$MODULE_URL"'",' \
		     '"integrations":{"embedJs":{' \
		     '"entrypoint":"/extension/'"$$MODULE_UUID"'",'; \
		if [ -n "$$MODULE_STYLESHEET" ]; then \
			echo '"stylesheet":"/extension/'"$$MODULE_UUID"'/stylesheet",'; \
		fi; \
		echo '"targets":['"$$MODULE_TARGETS"']}}}'; \
	); \
	echo "Sending request to CRM..."; \
	curl --request POST \
		--url "$$CRM_URL/api/v5/integration-modules/$$MODULE_NAME/edit" \
		--header "X-Api-Key: $$API_KEY" \
		--header "content-type: multipart/form-data" \
		--form "integrationModule=$$CURL_DATA"; \
