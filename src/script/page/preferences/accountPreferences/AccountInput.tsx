/*
 * Wire
 * Copyright (C) 2021 Wire Swiss GmbH
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

import React, {useEffect, useState} from 'react';
import Icon from 'Components/Icon';
import useIsMounted from 'Util/useIsMounted';
import {MotionDuration} from '../../../motion/MotionDuration';

interface AccountInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  allowedChars?: string;
  'data-uie-name'?: string;
  forceLowerCase?: boolean;
  isDone?: boolean;
  label: string;
  labelUie?: string;
  maxLength?: number;
  onValueChange?: (value: string) => void;
  prefix?: string;
  readOnly?: boolean;
  setIsEditing?: (isEditing: boolean) => void;
  suffix?: string;
  value: string;
  valueUie?: string;
}

export const useInputDone = () => {
  const [isDone, setIsDone] = useState(false);
  const isMounted = useIsMounted();

  const done = () => {
    if (isMounted()) {
      setIsDone(true);
    }

    setTimeout(() => {
      if (isMounted()) {
        setIsDone(false);
      }
    }, MotionDuration.X_LONG * 2);
  };

  return {done, isDone};
};

const AccountInput: React.FC<AccountInputProps> = ({
  label,
  value,
  readOnly,
  onValueChange,
  isDone = false,
  prefix,
  suffix,
  setIsEditing: setIsEditingExternal,
  forceLowerCase = false,
  maxLength,
  allowedChars,
  labelUie,
  valueUie,
  ...rest
}) => {
  const [input, setInput] = useState<string>();
  const [isEditing, setIsEditing] = useState(false);
  useEffect(() => {
    setInput(value);
  }, [value]);

  const updateInput = (value: string) => {
    if (allowedChars) {
      value = value.replace(new RegExp(`[^${allowedChars}]`, 'g'), '');
    }
    if (forceLowerCase) {
      value = value.toLowerCase();
    }
    if (maxLength) {
      value = value.substring(0, maxLength);
    }
    setInput(value);
  };
  const iconUiePrefix = rest['data-uie-name'] ?? 'account-input';
  return (
    <div
      css={{
        backgroundColor: isEditing ? 'var(--preference-account-input-bg)' : 'transparent',
        display: 'flex',
        flexDirection: 'column',
        height: 56,
        marginBottom: 40,

        padding: 8,

        svg: {marginLeft: 8},

        width: 280,
      }}
    >
      <label
        className="label"
        css={{
          color: 'var(--foreground)',
          lineHeight: '14px',
          marginBottom: 6,
          position: 'relative',
        }}
        data-uie-name={labelUie}
        htmlFor={valueUie}
      >
        {label}
        {!readOnly && (
          <button
            type="button"
            css={{background: 'transparent', border: 'none', margin: 0, padding: 0, position: 'absolute', top: '-1px'}}
            onClick={() => {
              setIsEditingExternal?.(true);
              setIsEditing(true);
            }}
          >
            {isDone ? (
              <Icon.AnimatedCheck
                css={{path: {stroke: 'var(--foreground)'}}}
                data-uie-name={`${iconUiePrefix}-icon-check`}
              />
            ) : (
              !isEditing && (
                <Icon.Edit
                  css={{fill: 'var(--foreground)'}}
                  className="edit-icon"
                  data-uie-name={`${iconUiePrefix}-icon`}
                />
              )
            )}
          </button>
        )}
      </label>
      <div
        css={{
          position: 'relative',
        }}
      >
        <div css={{alignItems: 'center', display: 'flex', lineHeight: '1.38', position: 'absolute'}}>
          <span data-uie-name={`${iconUiePrefix}-display`}>
            <span
              css={{
                opacity: isEditing ? 0.4 : 1,
              }}
            >
              {prefix}
            </span>
            <span css={{opacity: 0}}>{input}</span>
            <span
              css={{
                opacity: isEditing ? 0.4 : 1,
              }}
            >
              {suffix}
            </span>
          </span>
        </div>
        <div
          css={{
            alignItems: 'center',
            display: 'flex',
            lineHeight: '1.38',
            position: 'absolute',
            width: '100%',
          }}
        >
          <span css={{opacity: 0}}>{prefix}</span>
          {readOnly ? (
            <span data-uie-name={valueUie} data-uie-value={value} {...rest}>
              {value}
            </span>
          ) : (
            <input
              id={valueUie}
              className="text"
              css={{
                backgroundColor: 'transparent',
                border: 'none',
                lineHeight: '24px',
                outline: 'none',
                padding: 0,
                width: '100%',
              }}
              value={input}
              onChange={({target}) => updateInput(target.value)}
              onKeyPress={event => {
                if (event.key === 'Enter' && !event.shiftKey && !event.altKey) {
                  event.preventDefault();
                  onValueChange?.(input);
                  (event.target as HTMLInputElement).blur();
                }
              }}
              onBlur={() => {
                setInput(value);
                setIsEditingExternal?.(false);
                setIsEditing(false);
              }}
              spellCheck={false}
              {...rest}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountInput;
