/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/** Order of types supported by Firestore. */
export const enum TypeOrder {
  // This order is based on the backend's ordering, but modified to support
  // server timestamps.
  NullValue = 0,
  BooleanValue = 1,
  NumberValue = 2,
  TimestampValue = 3,
  ServerTimestampValue = 4,
  StringValue = 5,
  BlobValue = 6,
  RefValue = 7,
  GeoPointValue = 8,
  ArrayValue = 9,
  ObjectValue = 10
}
