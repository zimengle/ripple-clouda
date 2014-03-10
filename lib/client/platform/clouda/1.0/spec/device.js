/*
 *
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */
module.exports = {
    "NetworkStatus": {
        "connectionType": {
            "name": "Connection Type",
            "control": {
                "type": "select",
                "value": "ethernet"
            },
            "options": {
                "-1": "UNKNOWN",
                "1": "ETHERNET",
                "2": "WIFI",
                "3": "CELL_2G",
                "4": "CELL_3G",
                "5": "CELL_4G",
                "0": "none"
            },
            "callback": function (setting) {
                // var connected = setting !== "none";
                // ripple('bus').send("network", connected);
            }
        },
        "lag": {
            "name": "Lag the network",
            "control": {
                type: "checkbox",
                value: false
            },
            "callback": function (setting) {
                ripple('bus').send("lag", setting);
            }
        },
    },
    "globalization": {
        "locale": {
            "name": "locale name",
            "control": {
                "type": "select",
                "value": "en"
            },
            "options": {
                "en": "English",
                "en-ca": "English (Canadian)",
                "fr": "French",
                "fr-ca": "French (Canadian)",
                "de": "German"
            },
            "callback": function (setting) {
                moment.lang(setting);
            }
        }
    }
};
