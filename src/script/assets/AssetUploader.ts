/*
 * Wire
 * Copyright (C) 2019 Wire Swiss GmbH
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

import ko from 'knockout';
import {Asset} from '@wireapp/protocol-messaging';
import {AssetService, AssetUploadOptions} from './AssetService';
import {loadFileBuffer} from 'Util/util';
import {PROTO_MESSAGE_TYPE} from '../cryptography/ProtoMessageType';
import {encryptAesAsset} from './AssetCrypto';

export interface UploadStatus {
  messageId: string;
  progress: ko.Observable<number>;
  xhr?: XMLHttpRequest;
}

const uploadProgressQueue: ko.ObservableArray<UploadStatus> = ko.observableArray();
const uploadCancelTokens: {[messageId: string]: () => void} = {};

export class AssetUploader {
  private readonly assetService: AssetService;

  constructor(assetService: AssetService) {
    this.assetService = assetService;
  }

  async uploadFile(messageId: string, file: Blob, options: AssetUploadOptions): Promise<Asset> {
    const bytes = (await loadFileBuffer(file)) as ArrayBuffer;
    const {cipherText, keyBytes, sha256} = await encryptAesAsset(bytes);

    const progressObservable = ko.observable(0);
    uploadProgressQueue.push({messageId, progress: progressObservable});

    const request = await this.assetService.uploadFile(
      new Uint8Array(cipherText),
      {
        public: options.public,
        retention: options.retention,
      },
      (fraction: number) => {
        const percentage = fraction * 100;
        progressObservable(percentage);
      },
    );
    uploadCancelTokens[messageId] = request.cancel;

    return request.response
      .then(({key, token}) => {
        const assetRemoteData = new Asset.RemoteData({
          assetId: key,
          assetToken: token,
          otrKey: new Uint8Array(keyBytes),
          sha256: new Uint8Array(sha256),
        });
        const protoAsset = new Asset({
          [PROTO_MESSAGE_TYPE.ASSET_UPLOADED]: assetRemoteData,
          [PROTO_MESSAGE_TYPE.EXPECTS_READ_CONFIRMATION]: options.expectsReadConfirmation,
          [PROTO_MESSAGE_TYPE.LEGAL_HOLD_STATUS]: options.legalHoldStatus,
        });
        return protoAsset;
      })
      .then(asset => {
        this._removeFromQueue(messageId);
        return asset;
      });
  }

  uploadAsset(messageId: string, file: Blob, options: AssetUploadOptions): Promise<Asset> {
    return this.assetService
      .uploadImageAsset(file, options, (xhr: XMLHttpRequest) => {
        const progressObservable: ko.Observable<number> = ko.observable(0);
        uploadProgressQueue.push({messageId, progress: progressObservable, xhr});
        xhr.upload.onprogress = event => {
          const progress = (event.loaded / event.total) * 100;
          progressObservable(progress);
        };
      })
      .then((asset: Asset) => {
        this._removeFromQueue(messageId);
        return asset;
      });
  }

  cancelUpload(messageId: string): void {
    // Legacy code (will be removed soon)
    const uploadStatus = this._findUploadStatus(messageId);
    if (uploadStatus) {
      /* eslint-disable no-unused-expressions */
      /* @see https://github.com/typescript-eslint/typescript-eslint/issues/1138 */
      uploadStatus.xhr?.abort();
      this._removeFromQueue(messageId);
    }
    // New code
    const cancelToken = uploadCancelTokens[messageId];
    if (cancelToken) {
      cancelToken();
      this._removeFromQueue(messageId);
    }
  }

  getNumberOfOngoingUploads(): number {
    return uploadProgressQueue().length;
  }

  getUploadProgress(messageId: string): ko.PureComputed<number> {
    return ko.pureComputed(() => {
      const uploadStatus = this._findUploadStatus(messageId);
      return uploadStatus ? uploadStatus.progress() : -1;
    });
  }

  _findUploadStatus(messageId: string): UploadStatus {
    return uploadProgressQueue().find(upload => upload.messageId === messageId);
  }

  _removeFromQueue(messageId: string): void {
    uploadProgressQueue(uploadProgressQueue().filter(upload => upload.messageId !== messageId));
    delete uploadCancelTokens[messageId];
  }
}
