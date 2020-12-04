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

import { ParseContext } from '../../../src/api/parse_context';
import { FieldTransform } from '../../../src/model/mutation';

/**
 * Sentinel values that can be used when writing document fields with `set()`
 * or `update()`.
 */
export abstract class FieldValue {
  /**
   * @param _methodName - The public API endpoint that returns this class.
   */
  constructor(public _methodName: string) {}

  abstract isEqual(other: FieldValue): boolean;
  abstract _toFieldTransform(context: ParseContext): FieldTransform | null;
}
