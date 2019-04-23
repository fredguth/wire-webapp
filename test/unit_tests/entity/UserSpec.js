/*
 * Wire
 * Copyright (C) 2018 Wire Swiss GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 *
 */

import User from 'src/script/entity/User';
import {ACCENT_ID} from 'src/script/config';

describe('User', () => {
  describe('First Name', () => {
    it('can generate first name', () => {
      const user_et = new User();
      user_et.name('John Doe');

      expect(user_et.first_name()).toBe('John');
    });
  });

  describe('Last Name', () => {
    it('can generate last name', () => {
      const user_et = new User();
      user_et.name('John Doe');

      expect(user_et.last_name()).toBe('Doe');
    });

    it('can generate last name', () => {
      const user_et = new User();
      user_et.name('John D. Doe');

      expect(user_et.last_name()).toBe('Doe');
    });

    it('can ignore last name if user has only one name', () => {
      const user_et = new User();
      user_et.name('John');

      expect(user_et.last_name()).toBeUndefined();
    });
  });

  describe('Initials', () => {
    it('returns correct initials for user with first name and last name', () => {
      const user_et = new User();
      user_et.name('John Doe');

      expect(user_et.initials()).toBe('JD');
    });

    it('returns correct initials for user with just a first name', () => {
      const user_et = new User();
      user_et.name('John');

      expect(user_et.initials()).toBe('JO');
    });

    it('returns correct initials for user with middle name', () => {
      const user_et = new User();
      user_et.name('John Peter Doe');

      expect(user_et.initials()).toBe('JD');
    });

    it('returns correct initials for user with one character as name', () => {
      const user_et = new User();
      user_et.name('J');

      expect(user_et.initials()).toBe('J');
    });

    it('returns correct initials for user with an emoji as name', () => {
      const user_et = new User();
      user_et.name('🐒');

      expect(user_et.initials()).toBe('🐒');
    });
  });

  describe('add_client', () =>
    it('accepts clients which are no duplicates', () => {
      const first_client = new z.client.ClientEntity();
      first_client.id = '5021d77752286cac';

      const second_client = new z.client.ClientEntity();
      second_client.id = '575b7a890cdb7635';

      const user_et = new User();
      user_et.add_client(first_client);
      user_et.add_client(second_client);
      user_et.add_client(second_client);

      expect(user_et.devices().length).toBe(2);
    }));

  describe('accent_color', () =>
    it('can change the accent color', () => {
      const userEntity = new User();
      userEntity.accent_id(ACCENT_ID.BLUE);

      expect(userEntity.accent_color()).toBe(User.ACCENT_COLOR[ACCENT_ID.BLUE]);

      Object.values(ACCENT_ID).forEach(accentId => {
        userEntity.accent_id(accentId);

        expect(userEntity.accent_color()).toBe(User.ACCENT_COLOR[accentId]);
      });

      userEntity.accent_id(undefined);

      expect(userEntity.accent_color()).toBe(User.ACCENT_COLOR[ACCENT_ID.BLUE]);
    }));
});
